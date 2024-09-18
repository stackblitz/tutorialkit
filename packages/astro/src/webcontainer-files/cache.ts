import path from 'node:path';
import type { AstroIntegrationLogger } from 'astro';
import { dim } from 'kleur/colors';
import type { ViteDevServer } from '../types.js';
import { withResolvers } from '../utils.js';
import { FILES_FOLDER_NAME, SOLUTION_FOLDER_NAME } from './constants.js';
import { FilesMapGraph } from './filesmap.js';
import { getFilesRef, type ContentDirs } from './utils.js';

export class FilesMapCache {
  // map of filesRef to file content
  private _cache = new Map<string, string | undefined>();

  // files that will be generated
  private _requestsQueue = new Set<string>();

  // a promise to wait on before serving a request for the end user
  private _readiness: Promise<void>;
  private _resolve: () => void;

  // this is to know which FileMaps are in use to decide whether or not the page should be reloaded
  private _hotPaths = new Set<string>();
  private _timeoutId: NodeJS.Timeout | null = null;

  constructor(
    private _filesMapGraph: FilesMapGraph,
    private _logger: AstroIntegrationLogger,
    private _server: ViteDevServer,
    private _dirs: ContentDirs,
  ) {
    const { promise, resolve } = withResolvers<void>();

    this._readiness = promise;
    this._resolve = resolve;

    for (const filesMap of _filesMapGraph.allFilesMap()) {
      this._requestsQueue.add(filesMap.path);
      this._cache.set(getFilesRef(filesMap.path, this._dirs), undefined);
    }

    this._generateFileMaps();
  }

  generateFileMapForPath(filePath: string) {
    const filesMapFolderPath = resolveFilesFolderPath(filePath, this._logger, this._dirs);

    if (!filesMapFolderPath) {
      this._logger.warn(`File ${filePath} is not part of the tutorial content or templates folders.`);
      return;
    }

    const filesRef = getFilesRef(filesMapFolderPath, this._dirs);

    // clear the existing cache value (mark it as stale)
    this._cache.set(filesRef, undefined);

    // if it's a template do the same for its dependencies recursively
    this._invalidateCacheForDependencies(filesMapFolderPath);

    // add this file as required to be processed
    this._requestsQueue.add(filesMapFolderPath);

    if (this._timeoutId) {
      return;
    }

    const { promise, resolve } = withResolvers<void>();

    this._readiness = promise;
    this._resolve = resolve;
    this._timeoutId = setTimeout(this._generateFileMaps, 100);
  }

  async canHandle(reqURL: string | undefined): Promise<string | false> {
    const fileMapPath = new URL(reqURL ?? '/', 'http://a').pathname.slice(1);

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

    // mark the path as "hot", meaning we should refresh the files in webcontainer once the file generation has completed
    this._hotPaths.add(fileMapPath);

    return cacheValue;
  }

  private _invalidateCacheForDependencies(folderPath: string) {
    const filesMap = this._filesMapGraph.getFilesMapByFolder(folderPath);

    if (!filesMap) {
      return;
    }

    for (const dependency of filesMap.allDependents()) {
      this._cache.set(getFilesRef(dependency.path, this._dirs), undefined);
    }
  }

  private _generateFileMaps = async () => {
    const hotFilesRefs: string[] = [];

    while (this._requestsQueue.size > 0) {
      // first we update all files map
      for (const folderPath of this._requestsQueue) {
        this._filesMapGraph.updateFilesMapByFolder(folderPath, this._logger);
      }

      // then we make sure all their dependencies are added as well
      for (const folderPath of this._requestsQueue) {
        for (const dependency of this._filesMapGraph.getFilesMapByFolder(folderPath)!.allDependents()) {
          this._requestsQueue.add(dependency.path);
        }
      }

      const requests = [...this._requestsQueue].map((folderPath) => {
        return [getFilesRef(folderPath, this._dirs), this._filesMapGraph.getFilesMapByFolder(folderPath)!] as const;
      });

      this._requestsQueue.clear();

      await Promise.all(
        requests.map(async ([filesRef, filesMap]) => {
          if (this._hotPaths.has(filesRef)) {
            hotFilesRefs.push(filesRef);
          }

          const timeNow = performance.now();
          const fileMap = await filesMap.toFiles(this._logger);

          this._cache.set(filesRef, JSON.stringify(fileMap));

          const elapsed = performance.now() - timeNow;
          this._logger.info(`Generated ${filesRef} ${dim(Math.round(elapsed) + 'ms')}`);
        }),
      );
    }

    // the cache is now ready to be used
    this._resolve();

    if (hotFilesRefs.length > 0) {
      this._hotPaths.clear();
      this._server.hot.send({ type: 'custom', event: 'tk:refresh-wc-files', data: hotFilesRefs });
    }

    this._timeoutId = null;
  };
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
