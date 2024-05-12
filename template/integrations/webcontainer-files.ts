import type { AstroIntegration, AstroIntegrationLogger } from 'astro';
import { FSWatcher, watch } from 'chokidar';
import { dim } from 'kleur/colors';
import glob from 'fast-glob';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { IncomingMessage } from 'http';
import { withResolvers } from '../src/utils/promises';

type ViteDevServer = Parameters<Required<AstroIntegration['hooks']>['astro:server:setup']>['0']['server'];
type Files = Record<string, string>;

const FILES_FOLDER_NAME = '_files';
const SOLUTION_FOLDER_NAME = '_solution';
const CONTENT_DIR = path.join(import.meta.dirname, '../src/content/tutorial');
const TEMPLATES_DIR = path.join(import.meta.dirname, '../src/templates');

let watcher: FSWatcher;

export const webcontainerFiles: AstroIntegration = {
  name: 'webcontainer-files',
  hooks: {
    async 'astro:server:setup'({ server, logger }) {
      const cache = new FileMapCache(logger, server);

      watcher = watch([
        `${CONTENT_DIR}/**/${FILES_FOLDER_NAME}/**/*`,
        `${CONTENT_DIR}/**/${SOLUTION_FOLDER_NAME}/**/*`,
        TEMPLATES_DIR,
      ]);

      watcher.on('all', async (eventName, filePath) => {
        // new directories don't affect the file tree.
        if (eventName === 'addDir') {
          return;
        }

        cache.generateFileMapForPath(filePath);
      });

      server.middlewares.use(async (req, res, next) => {
        const result = await cache.canHandle(req);

        if (!result) {
          return next();
        }

        res.writeHead(200, {
          'Content-Type': 'application/json',
        });
        res.end(result);
      });
    },
    async 'astro:server:done'() {
      await watcher.close();
    },
    async 'astro:build:done'({ dir, logger }) {
      const folders = await glob(
        [`${CONTENT_DIR}/**/${FILES_FOLDER_NAME}`, `${CONTENT_DIR}/**/${SOLUTION_FOLDER_NAME}`, `${TEMPLATES_DIR}/*`],
        {
          onlyDirectories: true,
        },
      );

      await Promise.all(
        folders.map(async (folder) => {
          const fileRef = getFilesRef(folder);
          const dest = fileURLToPath(new URL(fileRef, dir));

          await fs.promises.writeFile(dest, await createFileMap(folder));

          logger.info(`${dim(fileRef)}`);
        }),
      );
    },
  },
};

class FileMapCache {
  // cache of filename to file content
  private _cache = new Map<string, string | undefined>();

  // files that will be generated
  private _requestsQueue = new Set<string>();

  // a promise to wait on before serving a request for the end user
  private _readyness = Promise.resolve();

  // this is to know which FileMaps are in use to decide whether or not the page should be reloaded
  private _hotPaths = new Set<string>();
  private _timeoutId: NodeJS.Timeout | null = null;

  constructor(
    private _logger: AstroIntegrationLogger,
    private _server: ViteDevServer,
  ) {}

  generateFileMapForPath(filePath: string) {
    const fileMapFolderPath = resolveFilesFolderPath(filePath);

    if (!fileMapFolderPath) {
      this._logger.warn(`File ${filePath} is not part of the tutorial or templates folders.`);
      return;
    }

    const fileRef = getFilesRef(fileMapFolderPath);

    // clear the existing cache value (mark it as stale)
    this._cache.set(fileRef, undefined);

    // add this file to the queue of
    this._requestsQueue.add(fileMapFolderPath);

    if (this._timeoutId) {
      return;
    }

    this._timeoutId = setTimeout(this._generateFileMaps, 10);
  }

  async canHandle(req: IncomingMessage): Promise<string | false> {
    const fileMapPath = new URL(req.url ?? '/', 'http://a').pathname.slice(1);

    // if it's not in the cache then this path is not handled by this cache
    if (!this._cache.has(fileMapPath)) {
      return false;
    }

    let cacheValue = this._cache.get(fileMapPath);

    // if the value is not present the cache is not fresh
    if (typeof cacheValue === 'undefined') {
      await this._readyness;

      cacheValue = this._cache.get(fileMapPath);
    }

    if (typeof cacheValue === 'undefined') {
      this._logger.error(`The cache never resolved for ${fileMapPath}`);
      return false;
    }

    // mark the path as "hot", meaning we should reload the page once the file generation has completed
    this._hotPaths.add(fileMapPath);

    return cacheValue;
  }

  private _generateFileMaps = async () => {
    const { promise, resolve } = withResolvers<void>();

    this._readyness = promise;

    let shouldReloadPage = false;

    while (this._requestsQueue.size > 0) {
      const requests = [...this._requestsQueue].map((folderPath) => [getFilesRef(folderPath), folderPath] as const);
      this._requestsQueue.clear();

      shouldReloadPage ||= requests.some(([fileRef]) => this._hotPaths.has(fileRef));

      await Promise.all(
        requests.map(async ([fileRef, folderPath]) => {
          const timeNow = performance.now();

          this._cache.set(fileRef, await createFileMap(folderPath));

          const elapsed = performance.now() - timeNow;
          this._logger.info(`Generated ${fileRef} ${dim(Math.round(elapsed) + 'ms')}`);
        }),
      );
    }

    // the cache is now ready to be used
    resolve();

    if (shouldReloadPage) {
      this._hotPaths.clear();
      this._server.hot.send({ type: 'full-reload' });
    }

    this._timeoutId = null;
  };
}

async function createFileMap(dir: string) {
  const filePaths = await glob(`${dir}/**/*`, {
    onlyFiles: true,
  });

  const files: Files = {};

  for (const filePath of filePaths) {
    const buffer = fs.readFileSync(filePath);

    try {
      const stringContent = new TextDecoder('utf-8', { fatal: true }).decode(buffer);

      files[`/${path.relative(dir, filePath)}`] = stringContent;
    } catch {
      files[`/${path.relative(dir, filePath)}`] = buffer.toString('base64');
    }
  }

  return JSON.stringify(files);
}

function resolveFilesFolderPath(filePath: string): string | undefined {
  if (filePath.startsWith(TEMPLATES_DIR)) {
    const index = filePath.indexOf(path.sep, TEMPLATES_DIR.length + 1);

    if (index === -1) {
      return undefined;
    }

    return filePath.slice(0, index);
  }

  if (filePath.startsWith(CONTENT_DIR)) {
    let filesFolder = filePath;

    while (filesFolder && !filesFolder.endsWith(FILES_FOLDER_NAME) && !filesFolder.endsWith(SOLUTION_FOLDER_NAME)) {
      // the folder wasn't found, this should never happen
      if (filesFolder === CONTENT_DIR) {
        return undefined;
      }

      filesFolder = path.dirname(filesFolder);
    }

    return filesFolder;
  }

  return undefined;
}

function getFilesRef(pathToFolder: string) {
  if (pathToFolder.startsWith(CONTENT_DIR)) {
    pathToFolder = pathToFolder.slice(CONTENT_DIR.length + 1);
  } else if (pathToFolder.startsWith(TEMPLATES_DIR)) {
    pathToFolder = 'template' + pathToFolder.slice(TEMPLATES_DIR.length);
  }

  return encodeURIComponent(pathToFolder.replaceAll('/', '-').replaceAll('_', '')) + '.json';
}
