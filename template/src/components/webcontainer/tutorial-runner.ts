import type { WebContainerProcess } from '@webcontainer/api';
import { webcontainer as webcontainerPromise } from './index';
import { newTask, type Task } from './utils/promises';
import { areFilesEqual, toFileTree } from './utils/files';
import type { Files } from '@entities/tutorial';

interface LoadFilesOptions {
  files: Files;
  template?: Files;
}

/**
 * There should be only a single instance of this class.
 *
 * The idea behind this class is that it manages the state
 * of WebContainer and exposes an interface that makes sense
 * to every component of TutorialKit.
 */
export class TutorialRunner {
  private _currentProcess: WebContainerProcess | null = null;
  private _currentTemplate: Files | null = null;

  loadFiles({ files, template }: LoadFilesOptions): Task<void> {
    return newTask(async (signal) => {
      const webcontainer = await webcontainerPromise;

      signal.throwIfAborted();

      // check if the template was changed
      if (template && (this._currentTemplate === null || !areFilesEqual(template, this._currentTemplate))) {
        this._currentTemplate = template;
        await webcontainer.mount(toFileTree(template));
      }

      signal.throwIfAborted();

      await webcontainer.mount(toFileTree(files));
    });
  }
}
