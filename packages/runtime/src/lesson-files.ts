import type { Files, FilesRefList, Lesson } from '@tutorialkit/types';
import { newTask, type Task } from './tasks.js';
import { wait } from './utils/promises.js';

type InvalidationResult =
  | {
      type: 'template' | 'files' | 'solution';
      files: Files;
    }
  | { type: 'none' };

export class LessonFilesFetcher {
  private _map = new Map<string, Files>();
  private _templateLoadTask?: Task<Files>;
  private _templateLoaded: string | undefined;

  constructor(private _basePathname: string = '/') {
    if (!this._basePathname.endsWith('/')) {
      this._basePathname = this._basePathname + '/';
    }
  }

  async invalidate(filesRef: string): Promise<InvalidationResult> {
    if (!this._map.has(filesRef)) {
      return { type: 'none' };
    }

    const type = getTypeFromFilesRef(filesRef);

    let files: Files;

    if (this._templateLoaded === filesRef) {
      files = await this._fetchTemplate(filesRef).promise;
    } else {
      files = await this._fetchFiles(filesRef);
    }

    return {
      type,
      files,
    };
  }

  async getLessonTemplate(lesson: Lesson): Promise<Files> {
    const templatePathname = `template-${lesson.data.template}.json`;

    if (this._map.has(templatePathname)) {
      return this._map.get(templatePathname)!;
    }

    if (this._templateLoadTask && this._templateLoaded === templatePathname) {
      return this._templateLoadTask.promise;
    }

    const task = this._fetchTemplate(templatePathname);

    return task.promise;
  }

  getLessonFiles(lesson: Lesson): Promise<Files> {
    return this._getFilesFromFilesRefList(lesson.files);
  }

  getLessonSolution(lesson: Lesson): Promise<Files> {
    return this._getFilesFromFilesRefList(lesson.solution);
  }

  private _fetchTemplate(templatePathname: string) {
    this._templateLoadTask?.cancel();

    const task = newTask(async (signal) => {
      const response = await fetch(`${this._basePathname}${templatePathname}`, { signal });

      if (!response.ok) {
        throw new Error(`Failed to fetch: status ${response.status}`);
      }

      const body = convertToFiles(await response.json());

      this._map.set(templatePathname, body);

      signal.throwIfAborted();

      return body;
    });

    this._templateLoadTask = task;
    this._templateLoaded = templatePathname;

    return task;
  }

  private async _getFilesFromFilesRefList(filesRefList: FilesRefList): Promise<Files> {
    // the ref does not have any content
    if (filesRefList[1].length === 0) {
      return {};
    }

    const pathname = filesRefList[0];

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
        const response = await fetch(`${this._basePathname}${pathname}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch ${pathname}: ${response.status} ${response.statusText}`);
        }

        const body = convertToFiles(await response.json());

        this._map.set(pathname, body);

        return body;
      } catch (error) {
        if (retry <= 0) {
          console.error(`Failed to fetch ${pathname} after 3 attempts.`);
          console.error(error);

          return {};
        }
      }

      retry -= 1;

      await wait(1000);
    }
  }
}

function convertToFiles(json: Record<string, string | { base64: string }>): Files {
  const result: Files = {};

  if (typeof json !== 'object') {
    return result;
  }

  for (const property in json) {
    const value = json[property];

    let transformedValue;

    if (typeof value === 'object') {
      transformedValue = Uint8Array.from(atob(value.base64), (char) => char.charCodeAt(0));
    } else {
      transformedValue = value;
    }

    result[property] = transformedValue;
  }

  return result;
}

function getTypeFromFilesRef(filesRef: string): 'template' | 'files' | 'solution' {
  if (filesRef.startsWith('template-')) {
    return 'template';
  }

  if (filesRef.endsWith('files.json')) {
    return 'files';
  }

  return 'solution';
}
