import { folderPathToFilesRef } from '@tutorialkit/types';
import type { AstroIntegrationLogger } from 'astro';
import { FSWatcher, watch } from 'chokidar';
import glob from 'fast-glob';
import type { IncomingMessage } from 'http';
import { dim } from 'kleur/colors';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroBuildDoneOptions, AstroServerSetupOptions, Files, ViteDevServer } from './types.js';
import { withResolvers } from './utils.js';

const FILES_FOLDER_NAME = '_files';
const SOLUTION_FOLDER_NAME = '_solution';
const IGNORED_FILES = ['**/.DS_Store', '**/*.swp'];

export class WebContainerFiles {
  private _watcher: FSWatcher | undefined;

  serverSetup(projectRoot: string, { server, logger }: AstroServerSetupOptions) {
    const { contentDir, templatesDir } = this._folders(projectRoot);
    const cache = new FileMapCache(logger, server, { contentDir, templatesDir });

    this._watcher = watch(
      [
        path.join(contentDir, `**/${FILES_FOLDER_NAME}/**/*`),
        path.join(contentDir, `**/${SOLUTION_FOLDER_NAME}/**/*`),
        templatesDir,
      ],
      {
        ignored: IGNORED_FILES,
      },
    );

    this._watcher.on('all', (eventName, filePath) => {
      // new directories don't affect the file tree
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
  }

  serverDone() {
    return this._watcher?.close();
  }

  async buildAssets(projectRoot: string, { dir, logger }: AstroBuildDoneOptions) {
    const { contentDir, templatesDir } = this._folders(projectRoot);

    const folders = await glob(
      [
        `${glob.convertPathToPattern(contentDir)}/**/${FILES_FOLDER_NAME}`,
        `${glob.convertPathToPattern(contentDir)}/**/${SOLUTION_FOLDER_NAME}`,
        `${glob.convertPathToPattern(templatesDir)}/*`,
      ],
      { onlyDirectories: true, ignore: IGNORED_FILES },
    );

    await Promise.all(
      folders.map(async (folder) => {
        folder = path.normalize(folder);

        const filesRef = getFilesRef(folder, { contentDir, templatesDir });
        const dest = fileURLToPath(new URL(filesRef, dir));

        await fs.promises.writeFile(dest, await createFileMap(folder));

        logger.info(`${dim(filesRef)}`);
      }),
    );
  }

  private _folders(projectRoot: string): ContentDirs {
    const contentDir = path.join(projectRoot, './src/content/tutorial');
    const templatesDir = path.join(projectRoot, './src/templates');

    return { contentDir, templatesDir };
  }
}

interface ContentDirs {
  templatesDir: string;
  contentDir: string;
}

class FileMapCache {
  // cache of filename to file content
  private _cache = new Map<string, string | undefined>();

  // files that will be generated
  private _requestsQueue = new Set<string>();

  // a promise to wait on before serving a request for the end user
  private _readiness = Promise.resolve();

  // this is to know which FileMaps are in use to decide whether or not the page should be reloaded
  private _hotPaths = new Set<string>();
  private _timeoutId: NodeJS.Timeout | null = null;

  constructor(
    private _logger: AstroIntegrationLogger,
    private _server: ViteDevServer,
    private _dirs: ContentDirs,
  ) {}

  generateFileMapForPath(filePath: string) {
    const fileMapFolderPath = resolveFilesFolderPath(filePath, this._logger, this._dirs);

    if (!fileMapFolderPath) {
      this._logger.warn(`File ${filePath} is not part of the tutorial or templates folders.`);
      return;
    }

    const filesRef = getFilesRef(fileMapFolderPath, this._dirs);

    // clear the existing cache value (mark it as stale)
    this._cache.set(filesRef, undefined);

    // add this file as required to be processed
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
      await this._readiness;

      cacheValue = this._cache.get(fileMapPath);
    }

    if (typeof cacheValue === 'undefined') {
      this._logger.error(`The cache never resolved for ${fileMapPath}.`);
      return false;
    }

    // mark the path as "hot", meaning we should reload the page once the file generation has completed
    this._hotPaths.add(fileMapPath);

    return cacheValue;
  }

  private _generateFileMaps = async () => {
    const { promise, resolve } = withResolvers<void>();

    this._readiness = promise;

    const hotFilesRefs: string[] = [];

    while (this._requestsQueue.size > 0) {
      const requests = [...this._requestsQueue].map((folderPath) => {
        return [getFilesRef(folderPath, this._dirs), folderPath] as const;
      });

      this._requestsQueue.clear();

      await Promise.all(
        requests.map(async ([filesRef, folderPath]) => {
          if (this._hotPaths.has(filesRef)) {
            hotFilesRefs.push(filesRef);
          }

          const timeNow = performance.now();

          this._cache.set(filesRef, await createFileMap(folderPath));

          const elapsed = performance.now() - timeNow;
          this._logger.info(`Generated ${filesRef} ${dim(Math.round(elapsed) + 'ms')}`);
        }),
      );
    }

    // the cache is now ready to be used
    resolve();

    if (hotFilesRefs.length > 0) {
      this._hotPaths.clear();
      this._server.hot.send({ type: 'custom', event: 'tk:refresh-wc-files', data: hotFilesRefs });
    }

    this._timeoutId = null;
  };
}

async function createFileMap(dir: string) {
  const filePaths = await glob(`${glob.convertPathToPattern(dir)}/**/*`, {
    onlyFiles: true,
    ignore: IGNORED_FILES,
  });

  // files are assumed to be sorted so that FileTree can skip some logic at runtime
  filePaths.sort();

  const files: Files = {};

  for (const filePath of filePaths) {
    const buffer = fs.readFileSync(filePath);

    try {
      const stringContent = new TextDecoder('utf-8', { fatal: true }).decode(buffer);

      files[`/${path.relative(dir, filePath)}`] = stringContent;
    } catch {
      files[`/${path.relative(dir, filePath)}`] = { base64: buffer.toString('base64') };
    }
  }

  return JSON.stringify(files);
}

function resolveFilesFolderPath(
  filePath: string,
  logger: AstroIntegrationLogger,
  { contentDir, templatesDir }: ContentDirs,
): string | undefined {
  if (filePath.startsWith(templatesDir)) {
    const index = filePath.indexOf(path.sep, templatesDir.length + 1);

    if (index === -1) {
      logger.error(`Bug: ${filePath} is not in a directory under ${templatesDir}`);
      return undefined;
    }

    return filePath.slice(0, index);
  }

  if (filePath.startsWith(contentDir)) {
    let filesFolder = filePath;

    while (filesFolder && !filesFolder.endsWith(FILES_FOLDER_NAME) && !filesFolder.endsWith(SOLUTION_FOLDER_NAME)) {
      // the folder wasn't found, this should never happen
      if (filesFolder === contentDir) {
        logger.error(`Bug: ${filePath} was not under ${FILES_FOLDER_NAME} or ${SOLUTION_FOLDER_NAME}`);
        return undefined;
      }

      filesFolder = path.dirname(filesFolder);
    }

    return filesFolder;
  }

  return undefined;
}

function getFilesRef(pathToFolder: string, { contentDir, templatesDir }: ContentDirs) {
  if (pathToFolder.startsWith(contentDir)) {
    pathToFolder = pathToFolder.slice(contentDir.length + 1);
  } else if (pathToFolder.startsWith(templatesDir)) {
    pathToFolder = 'template' + pathToFolder.slice(templatesDir.length);
  }

  return folderPathToFilesRef(pathToFolder);
}
