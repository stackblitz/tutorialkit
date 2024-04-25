import type { Files } from '@entities/tutorial';
import { escapeCodes } from '@utils/terminal';
import type { ServerReadyListener, WebContainer, WebContainerProcess } from '@webcontainer/api';
import { atom } from 'nanostores';
import { createContext } from 'react';
import { tick } from '../../utils/event-loop';
import { isWebContainerSupported, webcontainerContext, webcontainer as webcontainerPromise } from './index';
import type { ITerminal } from './shell';
import { areFilesEqual, toFileTree } from './utils/files';
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

interface RunCommandsOptions {
  /**
   * Main command to run. Typically a dev server, e.g. `npm run start`.
   */
  mainCommand?: string;

  /**
   * List of commands executed before the main command.
   */
  prepareCommands?: string[];

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
  private _lastRunCommands: RunCommandsOptions | undefined = undefined;

  /**
   * Subscribe to this atom to be notified of command failures and whether or not a command
   * is running. The command is provided as well as whether or not this is the "main" command
   */
  status = atom<Status>({ type: 'idle' });

  /**
   * Load the provided files into WebContainer.
   *
   * This function always wait for any previous `loadFiles` call to have completed before sending the next one.
   * It will cancel the previous load operation if `options.abortPreviousLoad` was set to true.
   *
   * @see {LoadFilesOptions}
   */
  loadFiles({ files, template, abortPreviousLoad = true }: LoadFilesOptions): void {
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
        this._currentTemplate = template;
        await webcontainer.mount(toFileTree(template));
      }

      signal.throwIfAborted();

      await webcontainer.mount(toFileTree(files));
    });
  }

  async onPreviewURLChange(listener: ServerReadyListener) {
    const webcontainer = await webcontainerPromise;

    return webcontainer.on('server-ready', listener);
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
        ].join('\n')
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
            ].join('\n')
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
  runCommands({ prepareCommands, mainCommand, abortPreviousRun = true }: RunCommandsOptions): void {
    const previousProcessPromise = this._currentProcessTask?.promise;
    const loadPromise = this._currentLoadTask?.promise;

    if (abortPreviousRun) {
      this._currentProcessTask?.cancel();
    }

    this._lastRunCommands = { prepareCommands, mainCommand };

    this._currentProcessTask = newTask(async (signal) => {
      await Promise.all([previousProcessPromise, loadPromise]);

      const webcontainer = await webcontainerPromise;

      signal.throwIfAborted();

      let process: WebContainerProcess | undefined;

      const abortListener = () => process?.kill();
      const commands = (prepareCommands ?? []).concat(mainCommand ? [mainCommand] : []).filter(Boolean);

      signal.addEventListener('abort', abortListener);

      for (const [index, command] of commands.entries()) {
        this.status.set({ type: 'running', command, main: index === commands.length - 1 && !!mainCommand });

        process = await this._newProcess(webcontainer, command);

        signal.throwIfAborted();

        const exitCode = await process.exit;

        if (exitCode !== 0) {
          this.status.set({ type: 'error', command, exitCode });
        }

        signal.throwIfAborted();
      }

      this.status.set({ type: 'idle' });
    });
  }

  /**
   * Restart the last run command that was submitted.
   */
  restartLastRunCommands() {
    if (!this._lastRunCommands) {
      return;
    }

    this.runCommands({ ...this._lastRunCommands, abortPreviousRun: true });
  }

  private async _newProcess(webcontainer: WebContainer, shellCommand: string) {
    const [command, ...args] = shellCommand.split(' ');

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
}

export const TutorialRunnerContext = createContext(new TutorialRunner());

function clearTerminal(terminal: ITerminal) {
  terminal.reset();
  terminal.write(escapeCodes.clear);
}
