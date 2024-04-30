import type { Files } from '@entities/tutorial';
import { escapeCodes } from '@utils/terminal';
import type { WebContainer, WebContainerProcess } from '@webcontainer/api';
import { atom } from 'nanostores';
import { createContext } from 'react';
import { tick } from '../../utils/event-loop';
import { isWebContainerSupported, webcontainerContext, webcontainer as webcontainerPromise } from './index';
import type { ITerminal } from './shell';
import { areFilesEqual, diffFiles, toFileTree } from './utils/files';
import { newTask, type Task } from './utils/promises';

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

type Command =
  | string
  | [command: string, title: string]
  | {
      command: string;
      title: string;
    };

interface Commands {
  /**
   * Main command to run. Typically a dev server, e.g. `npm run start`.
   */
  mainCommand?: Command;

  /**
   * List of commands executed before the main command.
   */
  prepareCommands?: Command[];
}

interface RunCommandsOptions extends Commands {
  /**
   * Abort the previous run commands operation.
   *
   * @default true
   */
  abortPreviousRun?: boolean;
}

type Status = CommandRunning | CommandError | Idle;

interface Idle {
  type: 'idle';
}

interface CommandRunning {
  type: 'running';
  main: boolean;
  command: string;
}

interface CommandError {
  type: 'error';
  command: string;
  exitCode: number;
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
  private _previousRunCommands: RunCommandsOptions | undefined = undefined;

  private _packageJsonDirty = false;

  // this strongly assumes that there's a single package json which might not be true
  private _packageJsonContent = '';

  private _previewPort: number | undefined = undefined;

  /**
   * Subscribe to this atom to be notified of command failures and whether or not a command
   * is running. The command is provided as well as whether or not this is the "main" command
   */
  status = atom<Status>({ type: 'idle' });

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

    return webcontainer.on('server-ready', (port, url) => {
      if (this._previewPort === undefined || this._previewPort === port) {
        this.previewUrl.set(url);
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
  prepareFiles({ files, template, abortPreviousLoad = true }: LoadFilesOptions): void {
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

    this._previousRunCommands = commands;

    this._currentProcessTask = newTask(async (signal) => {
      await Promise.all([previousProcessPromise, loadPromise]);

      const webcontainer = await webcontainerPromise;

      signal.throwIfAborted();

      return this._runCommands(webcontainer, commands, signal);
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
      const commandList = commandsToList(commands);

      for (const [index, command] of commandList.entries()) {
        const isMainCommand = index === commandList.length - 1 && !!commands.mainCommand;

        this.status.set({ type: 'running', command, main: isMainCommand });

        // print newlines between commands to visually separate them from one another
        if (index > 0) {
          this._terminal?.write('\n');
        }

        process = await this._newProcess(webcontainer, command);

        signal.throwIfAborted();

        if (isMainCommand) {
          this._clearDirtyState();
        }

        const exitCode = await process.exit;

        if (exitCode !== 0) {
          this.status.set({ type: 'error', command, exitCode });
        }

        signal.throwIfAborted();
      }

      if (!hasMainCommand) {
        this._clearDirtyState();
      }

      this.status.set({ type: 'idle' });
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

  private _changeDetection(newCommands: Commands) {
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
      if (!areCommandEqual(prevCommandList[i], newCommandList[i])) {
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

function areCommandEqual(a: Command, b: Command) {
  return toScript(a) === toScript(b);
}

function toScript(c: Command) {
  if (typeof c === 'string') {
    return c;
  }

  if (Array.isArray(c)) {
    return c[0];
  }

  return c.command;
}

function commandsToList({ prepareCommands, mainCommand }: Commands): string[] {
  return (prepareCommands ?? [])
    .concat(mainCommand ? [mainCommand] : [])
    .map(toScript)
    .filter(Boolean);
}

async function updateFiles(webcontainer: WebContainer, previousFiles: Files, newFiles: Files) {
  const { removed, addedOrModified } = diffFiles(previousFiles, newFiles);

  for (const filePath of removed) {
    await webcontainer.fs.rm(filePath, { force: true });
  }

  await webcontainer.mount(toFileTree(addedOrModified));
}
