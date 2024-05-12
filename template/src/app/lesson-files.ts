import type { Files, FilesRef, Lesson } from '@entities/tutorial';
import { newTask, type Task } from './webcontainer/utils/tasks';
import { wait } from '@utils/promises';

export class LessonFilesFetcher {
  private _map = new Map<string, Files>();
  private _templateLoadTask?: Task<Files>;
  private _templateLoaded: string | undefined;

  async getLessonTemplate(lesson: Lesson): Promise<Files> {
    const templatePathname = `template-${lesson.data.template}`;

    if (this._map.has(templatePathname)) {
      return this._map.get(templatePathname)!;
    }

    if (this._templateLoadTask && this._templateLoaded === templatePathname) {
      return this._templateLoadTask.promise;
    }

    this._templateLoadTask?.cancel();

    const task = newTask(async (signal) => {
      const response = await fetch(`/${templatePathname}.json`, { signal });

      if (!response.ok) {
        throw new Error(`Failed to fetch: status ${response.status}`);
      }

      const body: Files = await response.json();

      this._map.set(templatePathname, body);

      signal.throwIfAborted();

      return body;
    });

    this._templateLoadTask = task;
    this._templateLoaded = templatePathname;

    return task.promise;
  }

  getLessonFiles(lesson: Lesson): Promise<Files> {
    return this._getContentForFilesRef(lesson.files);
  }

  getLessonSolution(lesson: Lesson): Promise<Files> {
    return this._getContentForFilesRef(lesson.solution);
  }

  private async _getContentForFilesRef(filesRef: FilesRef): Promise<Files> {
    // the ref does not have any content
    if (filesRef[1].length === 0) {
      return {};
    }

    const pathname = this._getPathToFetch(filesRef[0]);

    if (this._map.has(pathname)) {
      return this._map.get(pathname)!;
    }

    const promise = this._fetchFiles(pathname);

    return promise;
  }

  private async _fetchFiles(pathname: string): Promise<Files> {
    let retry = 2;

    while (true) {
      try {
        const response = await fetch(`/${pathname}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch ${pathname}: ${response.status} ${response.statusText}`);
        }

        const body: Files = await response.json();

        this._map.set(pathname, body);

        return body;
      } catch (error) {
        if (retry <= 0) {
          // console.error(`Failed to fetch ${pathname} after 3 attempts.`);
          // console.error(error);

          return {};
        }
      }

      retry -= 1;

      await wait(1000);
    }
  }

  private _getPathToFetch(folder: string) {
    const pathToFetch = encodeURIComponent(folder.replaceAll('/', '-').replaceAll('_', '')) + '.json';

    return pathToFetch;
  }
}

export const lessonFilesFetcher = new LessonFilesFetcher();
