import type { CommandsSchema, Files, PreviewSchema, TerminalSchema } from '@tutorialkit/types';
import type { WebContainer, WebContainerProcess } from '@webcontainer/api';
import { auth } from '@webcontainer/api';
import { atom } from 'nanostores';
import { newTask, type Task, type TaskCancelled } from './tasks.js';
import { escapeCodes, type ITerminal } from './terminal.js';
import { tick } from './utils/promises.js';
import { isWebContainerSupported } from './utils/support.js';
import { Command, Commands } from './webcontainer/command.js';
import { PreviewInfo } from './webcontainer/preview-info.js';
import { newJSHProcess } from './webcontainer/shell.js';
import { StepsController } from './webcontainer/steps.js';
import { diffFiles, toFileTree } from './webcontainer/utils/files.js';
import { TerminalConfig, TerminalPanel } from './webcontainer/terminal-config.js';

interface LoadFilesOptions {
  /**
   * The list of files to load.
   */
  files: Files | Promise<Files>;

  /**
   * The template to load.
   */
  template?: Files | Promise<Files>;

  /**
   * If true, all files will be removed (except for `node_modules`).
   *
   * @default false
   */
  removeAllFiles?: boolean;

  /**
   * Abort the previous load files operation.
   *
   * @default true
   */
  abortPreviousLoad?: boolean;

  /**
   * A signal to abort this operation.
   */
  signal?: AbortSignal;
}

interface RunCommandsOptions extends CommandsSchema {
  /**
   * Abort the previous run commands operation.
   *
   * @default true
   */
  abortPreviousRun?: boolean;
}

/**
 * The idea behind this class is that it manages the state of WebContainer and exposes
 * an interface that makes sense to every component of TutorialKit.
 *
 * There should be only a single instance of this class.
 */
export class TutorialRunner {
  private _webcontainerLoaded: boolean = false;
  private _currentLoadTask: Task<void | TaskCancelled> | undefined = undefined;
  private _currentProcessTask: Task<void | TaskCancelled> | undefined = undefined;
  private _currentCommandProcess: WebContainerProcess | undefined = undefined;
  private _currentTemplate: Files | undefined = undefined;
  private _currentFiles: Files | undefined = undefined;
  private _currentRunCommands: Commands | undefined = undefined;
  private _output: ITerminal | undefined = undefined;
  private _packageJsonDirty = false;

  // this strongly assumes that there's a single package json which might not be true
  private _packageJsonContent = '';

  private _availablePreviews = new Map<number, PreviewInfo>();
  private _previewsLayout: PreviewInfo[] = [];
  private _stepController = new StepsController();

  /**
   * Steps that the runner is or will be executing.
   */
  get steps() {
    return this._stepController.steps;
  }

  /**
   * Atom representing the current previews. If it's an empty array or none of
   * the previews are ready, then no preview can be shown.
   */
  previews = atom<PreviewInfo[]>([]);

  terminalConfig = atom<TerminalConfig>(new TerminalConfig());

  constructor(
    private _webcontainer: Promise<WebContainer>,
    private _useAuth: boolean = false,
  ) {
    this._init();
  }

  private async _init() {
    const webcontainer = await this._webcontainer;

    this._webcontainerLoaded = true;

    webcontainer.on('port', (port, type, url) => {
      let previewInfo = this._availablePreviews.get(port);

      if (!previewInfo) {
        previewInfo = new PreviewInfo(port, type === 'open');
        this._availablePreviews.set(port, previewInfo);
      }

      previewInfo.ready = type === 'open';
      previewInfo.baseUrl = url;

      if (this._previewsLayout.length === 0) {
        this.previews.set([previewInfo]);
      } else {
        this._previewsLayout = [...this._previewsLayout];
        this.previews.set(this._previewsLayout);
      }
    });
  }

  /**
   * Set the expected port for the preview to show. If this is not set,
   * the port of the first server that is ready will be used.
   */
  setPreviews(previews: PreviewSchema[] = []) {
    const previewInfos = previews.map((preview) => {
      const info = new PreviewInfo(preview);

      let previewInfo = this._availablePreviews.get(info.port);

      if (!previewInfo) {
        previewInfo = info;

        this._availablePreviews.set(previewInfo.port, previewInfo);
      } else {
        previewInfo.title = info.title;
      }

      return previewInfo;
    });

    let areDifferent = previewInfos.length != this._previewsLayout.length;

    if (!areDifferent) {
      for (let i = 0; i < previewInfos.length; i++) {
        areDifferent = !PreviewInfo.equals(previewInfos[i], this._previewsLayout[i]);

        if (areDifferent) {
          break;
        }
      }
    }

    if (!areDifferent) {
      return;
    }

    this._previewsLayout = previewInfos;

    /**
     * If a port is provided and the preview is already ready we update the previewUrl.
     * If no port is provided we default to the first preview ever to ready if there are any.
     */
    if (previews.length === 0) {
      const firstPreview = this._availablePreviews.values().next().value as PreviewInfo | undefined;

      this.previews.set(firstPreview ? [firstPreview] : []);
    } else {
      this.previews.set(this._previewsLayout);
    }
  }

  setTerminalConfiguration(config?: TerminalSchema) {
    const oldTerminalConfig = this.terminalConfig.get();
    const newTerminalConfig = new TerminalConfig(config);

    // iterate over the old terminal config and make a list of all terminal panels
    const panelMap = new Map<string, TerminalPanel>(oldTerminalConfig.panels.map((panel) => [panel.id, panel]));

    // iterate over the new terminal panels and try to re-use the old terminal with the new panel
    for (const panel of newTerminalConfig.panels) {
      try {
        const oldPanel = panelMap.get(panel.id);

        panelMap.delete(panel.id);

        if (oldPanel?.terminal) {
          // if we found a previous panel with the same id, attach that terminal to the new panel
          panel.attachTerminal(oldPanel.terminal);
        }

        if (panel.type === 'output') {
          if (this._currentCommandProcess) {
            // attach the current command process to the output panel
            panel.attachProcess(this._currentCommandProcess);
          }

          this._output = panel;
        }

        if (panel.type === 'terminal' && !oldPanel) {
          // if the panel is a terminal panel, and this panel didn't exist before, spawn a new JSH process
          this._bootWebContainer(panel).then(async (webcontainerInstance) => {
            panel.attachProcess(await newJSHProcess(webcontainerInstance, panel));
          });
        }
      } catch {
        // do nothing
      }
    }

    // kill all old processes which we couldn't re-use
    for (const panel of panelMap.values()) {
      panel.process?.kill();
    }

    this.terminalConfig.set(newTerminalConfig);
  }

  /**
   * Update the content of a single file in WebContainer.
   *
   * @param filePath path of the file
   * @param content new content of the file
   */
  updateFile(filePath: string, content: string): void {
    const previousLoadPromise = this._currentLoadTask?.promise;

    this._currentLoadTask = newTask(
      async (signal) => {
        await previousLoadPromise;

        const webcontainer = await this._webcontainer;

        signal.throwIfAborted();

        await webcontainer.fs.writeFile(filePath, content);

        this._updateCurrentFiles({ [filePath]: content });
      },
      { ignoreCancel: true },
    );
  }

  /**
   * Update the provided files in WebContainer.
   *
   * @param files Files to update.
   */
  updateFiles(files: Files): void {
    const previousLoadPromise = this._currentLoadTask?.promise;

    this._currentLoadTask = newTask(
      async (signal) => {
        await previousLoadPromise;

        const webcontainer = await this._webcontainer;

        signal.throwIfAborted();

        await webcontainer.mount(toFileTree(files));

        this._updateCurrentFiles(files);
      },
      { ignoreCancel: true },
    );
  }

  /**
   * Load the provided files into WebContainer and remove any other files that had been loaded previously.
   *
   * This function always waits for any previous `prepareFiles` or `updateFile(s)` call to have completed
   * before sending the next one.
   *
   * Previous load operations will be cancelled if `options.abortPreviousLoad` was set to true (which is the default).
   *
   * @see {LoadFilesOptions}
   */
  prepareFiles({ files, template, signal, abortPreviousLoad = true }: LoadFilesOptions): Promise<void | TaskCancelled> {
    const previousLoadPromise = this._currentLoadTask?.promise;

    if (abortPreviousLoad) {
      this._currentLoadTask?.cancel();
    }

    this._currentLoadTask = newTask(
      async (signal) => {
        await previousLoadPromise;

        const webcontainer = await this._webcontainer;

        signal.throwIfAborted();

        [template, files] = await Promise.all([template, files]);

        signal.throwIfAborted();

        if (this._currentFiles || this._currentTemplate) {
          await updateFiles(
            webcontainer,
            { ...this._currentTemplate, ...this._currentFiles },
            { ...template, ...files },
          );
        } else {
          await webcontainer.mount(toFileTree({ ...template, ...files }));
        }

        this._currentTemplate = { ...template };
        this._currentFiles = { ...files };

        this._updateDirtyState(files);
      },
      { ignoreCancel: true, signal },
    );

    return this._currentLoadTask.promise;
  }

  /**
   * Attaches the provided terminal with the panel matching the provided ID.
   *
   * @param id The ID of the panel to attach the terminal with.
   * @param terminal The terminal to hook up to the JSH process.
   */
  async attachTerminal(id: string, terminal: ITerminal) {
    const panel = this.terminalConfig.get().panels.find((panel) => panel.id === id)

    if (!panel) {
      // if we don't have a panel with the provided id, just exit.
      return;
    }

    panel.attachTerminal(terminal);
  }

  onTerminalResize(cols: number, rows: number) {
    if (cols && rows) {
      // iterate over all terminal panels and resize all processes
      for (const panel of this.terminalConfig.get().panels) {
        panel.process?.resize({ cols, rows });
      }
    }
  }

  /**
   * Runs a list of commands.
   *
   * This function always wait for any previous `runCommands` call to have completed before sending the next one.
   * It will cancel the previous operation if `options.abortPreviousRun` was set to true.
   *
   * Commands are split into two:
   *
   *  - `prepareCommands`: For example commands like `npm install`, `mkdir -p src/foobar`, etc.
   *  - `mainCommand`: Used to for example run a dev server or equivalent.
   *
   * @see {LoadFilesOptions}
   */
  runCommands({ abortPreviousRun = true, ...commands }: RunCommandsOptions): void {
    const previousTask = this._currentProcessTask;
    const loadPromise = this._currentLoadTask?.promise;

    const newCommands = new Commands(commands);
    let anyChange = this._changeDetection(commands);

    // if we already know that there's a change we can update the steps now
    if (anyChange) {
      this._stepController.setFromCommands([...newCommands]);
    }

    this._currentProcessTask = newTask(
      async (signal) => {
        /**
         * Make sure we wait for everything to be loaded on the fs before
         * checking for changes. We do this because we want to know if the
         * `package.json` changed.
         */
        await loadPromise;

        if (signal.aborted && abortPreviousRun) {
          previousTask?.cancel();
        }

        signal.throwIfAborted();

        anyChange ||= this._changeDetection(commands);

        if (!anyChange) {
          /**
           * If there are no changes and we have a previous task, then
           * we must link this new task to that previous one, otherwise
           * the link is broken and that task will never ends.
           *
           * We create that link here by awaiting it. Note that this `if`
           * here should always evaluate to true.
           */
          if (previousTask) {
            const abortListener = () => previousTask.cancel();
            signal.addEventListener('abort', abortListener, { once: true });

            return previousTask.promise;
          }

          return;
        }

        if (abortPreviousRun) {
          previousTask?.cancel();
        }

        this._currentRunCommands = newCommands;

        await previousTask?.promise;

        const webcontainer = await this._webcontainer;

        signal.throwIfAborted();

        return this._runCommands(webcontainer, newCommands, signal);
      },
      { ignoreCancel: true },
    );
  }

  /**
   * Restart the last run commands that were submitted.
   */
  restartLastRunCommands() {
    if (!this._currentRunCommands) {
      return;
    }

    const previousRunCommands = this._currentRunCommands;
    const previousProcessPromise = this._currentProcessTask?.promise;
    const loadPromise = this._currentLoadTask?.promise;

    this._currentProcessTask?.cancel();

    this._currentProcessTask = newTask(
      async (signal) => {
        await Promise.all([previousProcessPromise, loadPromise]);

        const webcontainer = await this._webcontainer;

        signal.throwIfAborted();

        return this._runCommands(webcontainer, previousRunCommands, signal);
      },
      { ignoreCancel: true },
    );
  }

  private async _runCommands(webcontainer: WebContainer, commands: Commands, signal: AbortSignal) {
    clearTerminal(this._output);

    const abortListener = () => this._currentCommandProcess?.kill();
    signal.addEventListener('abort', abortListener, { once: true });

    const hasMainCommand = !!commands.mainCommand;

    try {
      const commandList = [...commands];

      this._stepController.setFromCommands(commandList);

      // keep track of the current runnable command we are on
      let runnableCommands = 0;

      for (const [index, command] of commandList.entries()) {
        const isMainCommand = index === commandList.length - 1 && !!commands.mainCommand;

        if (!command.isRunnable()) {
          this._stepController.updateStep(index, {
            title: command.title,
            status: 'skipped',
          });

          continue;
        }

        this._stepController.updateStep(index, {
          title: command.title,
          status: 'running',
        });

        // print newlines between commands to visually separate them from one another
        if (runnableCommands > 0) {
          this._output?.write('\n');
        }

        runnableCommands++;

        this._currentCommandProcess = await this._newProcess(webcontainer, command.shellCommand);

        try {
          signal.throwIfAborted();
        } catch (error) {
          this._stepController.skipRemaining(index);
          throw error;
        }

        if (isMainCommand) {
          this._clearDirtyState();
        }

        const exitCode = await this._currentCommandProcess.exit;

        if (exitCode !== 0) {
          this._stepController.updateStep(index, {
            title: command.title,
            status: 'failed',
          });

          this._stepController.skipRemaining(index + 1);
          break;
        } else {
          this._stepController.updateStep(index, {
            title: command.title,
            status: 'completed',
          });
        }

        try {
          signal.throwIfAborted();
        } catch (error) {
          this._stepController.skipRemaining(index + 1);
          throw error;
        }
      }

      if (!hasMainCommand) {
        this._clearDirtyState();
      }
    } finally {
      signal.removeEventListener('abort', abortListener);
    }
  }

  private async _newProcess(webcontainer: WebContainer, shellCommand: string) {
    const [command, ...args] = shellCommand.split(' ');

    this._output?.write(`${escapeCodes.magenta('❯')} ${escapeCodes.green(command)} ${args.join(' ')}\n`);

    /**
     * We spawn the process and use a fallback for cols and rows in case the output is not connected to a visible
     * terminal yet.
     */
    const process = await webcontainer.spawn(command, args, {
      terminal: this._output
        ? {
            cols: this._output.cols ?? 80,
            rows: this._output.rows ?? 15,
          }
        : undefined,
    });

    process.output.pipeTo(new WritableStream({ write: (data) => this._output?.write(data) }));

    return process;
  }

  private _updateDirtyState(files: Files) {
    for (const filePath in files) {
      if (filePath.endsWith('/package.json') && files[filePath] != this._packageJsonContent) {
        this._packageJsonContent = files[filePath] as string;
        this._packageJsonDirty = true;

        return;
      }
    }
  }

  private _updateCurrentFiles(files: Files) {
    // if the file was not tracked by the existing list of files, add it
    if (this._currentFiles) {
      for (const filePath in files) {
        this._currentFiles[filePath] = files[filePath];
      }
    } else {
      this._currentFiles = { ...files };
    }

    this._updateDirtyState(files);
  }

  private _clearDirtyState() {
    this._packageJsonDirty = false;
  }

  private _changeDetection(newCommands: CommandsSchema) {
    if (this._packageJsonDirty) {
      return true;
    }

    if (!this._currentRunCommands) {
      return true;
    }

    const prevCommandList = commandsToList(this._currentRunCommands);
    const newCommandList = commandsToList(newCommands);

    if (prevCommandList.length !== newCommandList.length) {
      return true;
    }

    for (let i = 0; i < prevCommandList.length; ++i) {
      if (!Command.equals(prevCommandList[i], newCommandList[i])) {
        return true;
      }
    }

    return false;
  }

  private async _bootWebContainer(terminal: ITerminal) {
    validateWebContainerSupported(terminal);

    const isLoaded = this._webcontainerLoaded;

    if (this._useAuth && !isLoaded) {
      terminal.write('Waiting for authentication to complete...');

      await auth.loggedIn();

      clearTerminal(terminal);
    }

    if (!isLoaded) {
      terminal.write('Booting WebContainer...');
    }

    try {
      const webcontainerInstance = await this._webcontainer;

      if (!isLoaded) {
        clearTerminal(terminal);
      }

      return webcontainerInstance;
    } catch (error) {
      clearTerminal(terminal);

      await tick();

      terminal.write(
        [
          escapeCodes.red(`Looks like your browser's configuration is blocking WebContainers.`),
          '',
          `Let's troubleshoot this!`,
          '',
          'Read more at:',
          'https://webcontainers.io/guides/browser-config',
          '',
        ].join('\n'),
      );

      throw error;
    }
  }
}

function clearTerminal(terminal?: ITerminal) {
  terminal?.reset();
  terminal?.write(escapeCodes.clear);
}

function commandsToList(commands: Commands | CommandsSchema) {
  if (commands instanceof Commands) {
    return [...commands].filter((command) => command.isRunnable());
  }

  return commandsToList(new Commands(commands));
}

async function updateFiles(webcontainer: WebContainer, previousFiles: Files, newFiles: Files) {
  const { removed, addedOrModified } = diffFiles(previousFiles, newFiles);

  for (const filePath of removed) {
    await webcontainer.fs.rm(filePath, { force: true });
  }

  await webcontainer.mount(toFileTree(addedOrModified));
}

function validateWebContainerSupported(terminal: ITerminal) {
  if (!isWebContainerSupported()) {
    terminal.write(
      [
        escapeCodes.red('Incompatible Web Browser'),
        '',
        `WebContainers currently work in Chromium-based browsers, Firefox, and Safari 16.4. We're hoping to add support for more browsers as they implement the necessary Web Platform features.`,
        '',
        'Read more about browser support:',
        'https://webcontainers.io/guides/browser-support',
        '',
      ].join('\n'),
    );

    throw new Error('Incompatible Web Browser');
  }
}
