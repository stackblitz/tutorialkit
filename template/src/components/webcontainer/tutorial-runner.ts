import type { Files } from '@entities/tutorial';
import type { CommandsSchema } from '@schemas';
import { escapeCodes } from '@utils/terminal';
import type { WebContainer, WebContainerProcess } from '@webcontainer/api';
import { atom } from 'nanostores';
import { createContext } from 'react';
import { tick } from '../../utils/event-loop';
import { Command, Commands } from './command';
import { isWebContainerSupported, webcontainerContext, webcontainer as webcontainerPromise } from './index';
import type { ITerminal } from './shell';
import { areFilesEqual, diffFiles, toFileTree } from './utils/files';
import { newTask, type Task, type TaskCancelled } from './utils/promises';

interface LoadFilesOptions {
  /**
   * The list of files to load.
   */
  files: Files;

  /**
   * The template to load.
   */
  template?: Files;

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
  status: 'completed' | 'running' | 'errored' | 'skipped' | 'idle';
}

/**
 * The idea behind this class is that it manages the state of WebContainer and exposes
 * an interface that makes sense to every component of TutorialKit.
 *
 * There should be only a single instance of this class.
 */
export class TutorialRunner {
  private _currentLoadTask: Task<void> | undefined = undefined;
  private _currentProcessTask: Task<void> | undefined = undefined;

  private _terminal: ITerminal | undefined = undefined;
  private _currentTemplate: Files | undefined = undefined;

  private _previousFiles: Files | undefined = undefined;
  private _previousRunCommands: Commands | undefined = undefined;

  private _packageJsonDirty = false;

  // this strongly assumes that there's a single package json which might not be true
  private _packageJsonContent = '';

  private _previewPort: number | undefined = undefined;

  /**
   * Steps that the runner is or will be executing.
   */
  steps = atom<Steps | undefined>(undefined);

  /**
   * Atom representing the current preview url. If it's an empty string, no preview can
   * be shown.
   */
  previewUrl = atom<string>('');

  constructor() {
    this._init();
  }

  private async _init() {
    const webcontainer = await webcontainerPromise;

    webcontainer.on('port', (port, type, url) => {
      if (this._previewPort === undefined || this._previewPort === port) {
        this.previewUrl.set(type === 'open' ? url : '');
      }
    });
  }

  /**
   * Set the expected port for the preview to show. If this is not set,
   * the port of the first server that is ready will be used.
   */
  setPreviewPort(port: number | undefined) {
    this._previewPort = port;
  }

  updateFile(filePath: string, content: string): void {
    const previousLoadPromise = this._currentLoadTask?.promise;

    this._currentLoadTask = newTask(async (signal) => {
      await previousLoadPromise;

      const webcontainer = await webcontainerPromise;

      signal.throwIfAborted();

      await webcontainer.fs.writeFile(filePath, content);

      this._updateDirtyState({ [filePath]: content });
    });
  }

  /**
   * Load the provided files into WebContainer.
   *
   * This function always wait for any previous `loadFiles` call to have completed before sending the next one.
   * It will cancel the previous load operation if `options.abortPreviousLoad` was set to true.
   *
   * @see {LoadFilesOptions}
   */
  prepareFiles({ files, template, abortPreviousLoad = true }: LoadFilesOptions): Promise<void | TaskCancelled> {
    const previousLoadPromise = this._currentLoadTask?.promise;

    if (abortPreviousLoad) {
      this._currentLoadTask?.cancel();
    }

    this._currentLoadTask = newTask(async (signal) => {
      await previousLoadPromise;

      const webcontainer = await webcontainerPromise;

      signal.throwIfAborted();

      // check if the template changed
      if (template && (this._currentTemplate == null || !areFilesEqual(template, this._currentTemplate))) {
        if (this._currentTemplate) {
          await updateFiles(webcontainer, this._currentTemplate, template);
        } else {
          await webcontainer.mount(toFileTree(template));
        }

        this._currentTemplate = template;
        this._updateDirtyState(template);
      }

      signal.throwIfAborted();

      if (this._previousFiles) {
        await updateFiles(webcontainer, this._previousFiles, files);
      } else {
        await webcontainer.mount(toFileTree(files));
      }

      this._previousFiles = files;
      this._updateDirtyState(files);
    });

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
      terminal.write('Booting WebContainer...');

      webcontainerPromise
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
    const anyChange = this._changeDetection(commands);

    if (!anyChange) {
      return;
    }

    const previousProcessPromise = this._currentProcessTask?.promise;
    const loadPromise = this._currentLoadTask?.promise;

    if (abortPreviousRun) {
      this._currentProcessTask?.cancel();
    }

    const newCommands = new Commands(commands);
    this._previousRunCommands = newCommands;

    this._currentProcessTask = newTask(async (signal) => {
      await Promise.all([previousProcessPromise, loadPromise]);

      const webcontainer = await webcontainerPromise;

      signal.throwIfAborted();

      return this._runCommands(webcontainer, newCommands, signal);
    });
  }

  /**
   * Restart the last run commands that were submitted.
   */
  restartLastRunCommands() {
    if (!this._previousRunCommands) {
      return;
    }

    const previousRunCommands = this._previousRunCommands;
    const previousProcessPromise = this._currentProcessTask?.promise;
    const loadPromise = this._currentLoadTask?.promise;

    this._currentProcessTask?.cancel();

    this._currentProcessTask = newTask(async (signal) => {
      await Promise.all([previousProcessPromise, loadPromise]);

      const webcontainer = await webcontainerPromise;

      signal.throwIfAborted();

      return this._runCommands(webcontainer, previousRunCommands, signal);
    });
  }

  private async _runCommands(webcontainer: WebContainer, commands: Commands, signal: AbortSignal) {
    let process: WebContainerProcess | undefined;

    const abortListener = () => process?.kill();
    signal.addEventListener('abort', abortListener);

    const hasMainCommand = !!commands.mainCommand;

    try {
      const commandList = [...commands];

      const updateStep = (index: number, step: Step) => {
        const currentSteps = this.steps.value!;
        this.steps.set([...currentSteps.slice(0, index), step, ...currentSteps.slice(index + 1)]);
      };

      this.steps.set(
        commandList.map((command) => ({
          title: command.title,
          status: 'idle',
        })),
      );

      for (const [index, command] of commandList.entries()) {
        const isMainCommand = index === commandList.length - 1 && !!commands.mainCommand;

        if (!command.isRunnable()) {
          updateStep(index, {
            title: command.title,
            status: 'skipped',
          });
          continue;
        }

        updateStep(index, {
          title: command.title,
          status: 'running',
        });

        // print newlines between commands to visually separate them from one another
        if (index > 0) {
          this._terminal?.write('\n');
        }

        process = await this._newProcess(webcontainer, command.shellCommand);

        signal.throwIfAborted();

        if (isMainCommand) {
          this._clearDirtyState();
        }

        const exitCode = await process.exit;

        if (exitCode !== 0) {
          updateStep(index, {
            title: command.title,
            status: 'errored',
          });
          const currentSteps = this.steps.value!;
          this.steps.set([
            ...currentSteps.slice(0, index),
            {
              title: command.title,
              status: 'errored',
            },
            ...currentSteps.slice(index + 1).map((step) => ({
              ...step,
              status: 'skipped' as const,
            })),
          ]);
          break;
        } else {
          updateStep(index, {
            title: command.title,
            status: 'completed',
          });
        }

        signal.throwIfAborted();
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
        this._packageJsonContent = files[filePath];
        this._packageJsonDirty = true;

        return;
      }
    }
  }

  private _clearDirtyState() {
    this._packageJsonDirty = false;
  }

  private _changeDetection(newCommands: CommandsSchema) {
    if (this._packageJsonDirty) {
      return true;
    }

    if (!this._previousRunCommands) {
      return true;
    }

    const prevCommandList = commandsToList(this._previousRunCommands);
    const newCommandList = commandsToList(newCommands);

    if (prevCommandList.length !== newCommandList.length) {
      return true;
    }

    for (let i = 0; i < prevCommandList.length; ++i) {
      if (!Command.areEquals(prevCommandList[i], newCommandList[i])) {
        return true;
      }
    }

    return false;
  }
}

export const TutorialRunnerContext = createContext(new TutorialRunner());

function clearTerminal(terminal: ITerminal) {
  terminal.reset();
  terminal.write(escapeCodes.clear);
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
