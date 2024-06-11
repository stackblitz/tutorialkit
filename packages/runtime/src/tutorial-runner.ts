import type { CommandsSchema, Files } from '@tutorialkit/types';
import type { WebContainer, WebContainerProcess } from '@webcontainer/api';
import { newTask, type Task, type TaskCancelled } from './tasks.js';
import { clearTerminal, escapeCodes, type ITerminal } from './utils/terminal.js';
import { Command, Commands } from './webcontainer/command.js';
import { StepsController } from './webcontainer/steps.js';
import { diffFiles, toFileTree } from './webcontainer/utils/files.js';
import type { TerminalStore } from './store/terminal.js';

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

interface RunCommandsOptions {
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
  private _currentLoadTask: Task<void | TaskCancelled> | undefined = undefined;
  private _currentProcessTask: Task<void | TaskCancelled> | undefined = undefined;
  private _currentCommandProcess: WebContainerProcess | undefined = undefined;
  private _currentTemplate: Files | undefined = undefined;
  private _currentFiles: Files | undefined = undefined;
  private _currentRunCommands: Commands | undefined = undefined;
  private _packageJsonDirty = false;
  private _commandsChanged = false;

  // this strongly assumes that there's a single package json which might not be true
  private _packageJsonContent = '';

  constructor(
    private _webcontainer: Promise<WebContainer>,
    private _terminalStore: TerminalStore,
    private _stepController: StepsController,
  ) {}

  /**
   * Set the commands to run. This updates the reported `steps` if any have changed.
   *
   * This function is safe to call server side.
   *
   * To actually run them in webcontainer see `runCommands`.
   *
   * @param commands The commands schema.
   */
  setCommands(commands: CommandsSchema) {
    const newCommands = new Commands(commands);
    const anyChange = this._changeDetection(commands);

    // if we already know that there's a change we can update the steps now
    if (anyChange) {
      this._stepController.setFromCommands([...newCommands]);
      this._currentRunCommands = newCommands;
      this._commandsChanged = true;
    }
  }

  onTerminalResize(cols: number, rows: number) {
    this._currentCommandProcess?.resize({ cols, rows });
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
   * Runs the list of commands set with `setCommands`.
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
  runCommands({ abortPreviousRun = true }: RunCommandsOptions = {}): void {
    const previousTask = this._currentProcessTask;
    const loadPromise = this._currentLoadTask?.promise;
    const newCommands = this._currentRunCommands;
    const commandsChanged = this._commandsChanged;

    if (!newCommands) {
      throw new Error('setCommands should be called before runCommands');
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

        const anyChange = this._packageJsonDirty || commandsChanged;

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

        // there were changes so we reset the "commands changed"
        this._commandsChanged = false;

        if (abortPreviousRun) {
          previousTask?.cancel();
        }

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
    if (!this._currentRunCommands || !this._currentProcessTask) {
      return;
    }

    const previousRunCommands = this._currentRunCommands;
    const previousProcessPromise = this._currentProcessTask.promise;
    const loadPromise = this._currentLoadTask?.promise;

    this._currentProcessTask.cancel();

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
    const output = this._terminalStore.getOutputPanel();

    clearTerminal(output);

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
          output?.write('\n');
        }

        runnableCommands++;

        this._currentCommandProcess = await this._newProcess(webcontainer, output, command.shellCommand);

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

  private async _newProcess(webcontainer: WebContainer, output: ITerminal | undefined, shellCommand: string) {
    const [command, ...args] = shellCommand.split(' ');

    output?.write(`${escapeCodes.magenta('❯')} ${escapeCodes.green(command)} ${args.join(' ')}\n`);

    /**
     * We spawn the process and use a fallback for cols and rows in case the output is not connected to a visible
     * terminal yet.
     */
    const process = await webcontainer.spawn(command, args, {
      terminal: output
        ? {
            cols: output.cols ?? 80,
            rows: output.rows ?? 15,
          }
        : undefined,
    });

    process.output.pipeTo(new WritableStream({ write: (data) => output?.write(data) }));

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
