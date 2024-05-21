import type { Files, CommandsSchema, PreviewSchema } from '@tutorialkit/types';
import { escapeCodes } from '@utils/terminal';
import type { WebContainer, WebContainerProcess } from '@webcontainer/api';
import { atom } from 'nanostores';
import { tick } from '../../utils/event-loop';
import { Command, Commands } from './command';
import { isWebContainerSupported, webcontainerContext, webcontainer as webcontainerPromise } from './index';
import { PreviewInfo } from './preview-info';
import type { ITerminal } from './shell';
import { diffFiles, toFileTree } from './utils/files';
import { newTask, type Task, type TaskCancelled } from './utils/tasks';
import { StepsController } from './steps';

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

type Steps = Step[];

export interface Step {
  title: string;
  status: 'completed' | 'running' | 'failed' | 'skipped' | 'idle';
}

/**
 * The idea behind this class is that it manages the state of WebContainer and exposes
 * an interface that makes sense to every component of TutorialKit.
 *
 * There should be only a single instance of this class.
 */
export class TutorialRunner {
  private _currentLoadTask: Task<void | TaskCancelled> | undefined = undefined;
  private _currentProcessTask: Task<void | TaskCancelled> | undefined = undefined;
  private _currentCommandProcess: WebContainerProcess | undefined = undefined;
  private _currentTemplate: Files | undefined = undefined;
  private _currentFiles: Files | undefined = undefined;
  private _currentRunCommands: Commands | undefined = undefined;
  private _terminal: ITerminal | undefined = undefined;
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

  constructor() {
    this._init();
  }

  private async _init() {
    const webcontainer = await webcontainerPromise;

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

        const webcontainer = await webcontainerPromise;

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

        const webcontainer = await webcontainerPromise;

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

        const webcontainer = await webcontainerPromise;

        signal.throwIfAborted();

        [template, files] = await Promise.all([template, files]);

        signal.throwIfAborted();

        // always re-apply the template as a lesson could have touched some of its files
        if (template) {
          await webcontainer.mount(toFileTree(template));

          this._updateDirtyState(template);
        }

        signal.throwIfAborted();

        if (this._currentFiles || this._currentTemplate) {
          await updateFiles(
            webcontainer,
            { ...this._currentTemplate, ...this._currentFiles },
            { ...template, ...files },
          );
        } else {
          await webcontainer.mount(toFileTree(files));
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
   * Connect a terminal to WebContainer in order to get output of processes executed by the
   * `TutorialRunner`.
   *
   * @param terminal Terminal to hook up to WebContainer.
   */
  hookTerminal(terminal: ITerminal) {
    this._terminal = terminal;

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

      return;
    }

    if (!webcontainerContext.loaded) {
      Promise.resolve()
        .then(async () => {
          if (webcontainerContext.useAuth) {
            terminal.write('Waiting for authentication to complete...');

            await webcontainerContext.loggedIn();
          }

          terminal.write('Booting WebContainer...');

          return webcontainerPromise;
        })
        .then(async () => {
          await tick();

          clearTerminal(terminal);
        })
        .catch(async () => {
          /**
           * We wait until the next tick to render the error cause it can happen
           * that the terminal is not cleared.
           */
          await tick();

          clearTerminal(terminal);

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
        });
    }
  }

  onTerminalResize() {
    const { cols, rows } = this._terminal ?? {};

    if (cols && rows) {
      this._currentCommandProcess?.resize({ cols, rows });
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

        const webcontainer = await webcontainerPromise;

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

        const webcontainer = await webcontainerPromise;

        signal.throwIfAborted();

        return this._runCommands(webcontainer, previousRunCommands, signal);
      },
      { ignoreCancel: true },
    );
  }

  private async _runCommands(webcontainer: WebContainer, commands: Commands, signal: AbortSignal) {
    clearTerminal(this._terminal);

    const abortListener = () => this._currentCommandProcess?.kill();
    signal.addEventListener('abort', abortListener, { once: true });

    const hasMainCommand = !!commands.mainCommand;

    try {
      const commandList = [...commands];

      this._stepController.setFromCommands(commandList);

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
        if (index > 0) {
          this._terminal?.write('\n');
        }

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

    this._terminal?.write(`${escapeCodes.magenta('❯')} ${escapeCodes.green(command)} ${args.join(' ')}\n`);

    const process = await webcontainer.spawn(command, args, {
      terminal: this._terminal
        ? {
            cols: this._terminal.cols,
            rows: this._terminal.rows,
          }
        : undefined,
    });

    process.output.pipeTo(new WritableStream({ write: (data) => this._terminal?.write(data) }));

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
}

export const tutorialRunner = new TutorialRunner();

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
