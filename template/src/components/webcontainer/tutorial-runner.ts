import type { WebContainerProcess } from '@webcontainer/api';
import { webcontainer as webcontainerPromise } from './index';
import { newShellProcess, type ITerminal } from './shell';
import { newTask, type Task } from './utils';

/**
 * There should be only a single instance of this class.
 *
 * The idea behind this class is that it manages the state
 * of WebContainer and exposes an interface that makes sense
 * to every component of TutorialKit.
 */
export class TutorialRunner {
  private _mainProcess: WebContainerProcess | null = null;

  installDependencies(options: { packageManager: 'npm' | 'yarn' | 'pnpm' }): Task<number> {
    return newTask(async (signal) => {
      const webcontainer = await webcontainerPromise;

      signal.throwIfAborted();

      const process = await webcontainer.spawn(options.packageManager, ['install'], {
        output: false,
      });

      signal.throwIfAborted();

      const abortListener = () => process.kill();

      // if the task is aborted we kill the process
      signal.addEventListener('abort', abortListener, { once: true });

      const result = await process.exit;

      signal.removeEventListener('abort', abortListener);

      return result;
    });
  }

  newShell(isMainProcess: boolean, terminal: ITerminal): Task<void> {
    return newTask(async (signal) => {
      const webcontainer = await webcontainerPromise;

      signal.throwIfAborted();

      if (isMainProcess && this._mainProcess != null) {
        this._mainProcess.kill();
      }

      this._mainProcess = await newShellProcess(webcontainer, signal, terminal);
    });
  }
}
