import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FSWatcher, watch } from 'chokidar';
import { dim } from 'kleur/colors';
import type { AstroBuildDoneOptions, AstroServerSetupOptions } from '../types.js';
import { FilesMapCache } from './cache.js';
import { FILES_FOLDER_NAME, IGNORED_FILES, SOLUTION_FOLDER_NAME } from './constants.js';
import { FilesMap } from './filesmap.js';
import { getAllFilesMap, getFilesRef, type ContentDirs } from './utils.js';

export class WebContainerFiles {
  private _watcher: FSWatcher | undefined;

  async serverSetup(projectRoot: string, { server, logger }: AstroServerSetupOptions) {
    const { contentDir, templatesDir } = this._folders(projectRoot);
    const graph = await FilesMap.initGraph(await getAllFilesMap({ contentDir, templatesDir }), logger);
    const cache = new FilesMapCache(graph, logger, server, { contentDir, templatesDir });

    this._watcher = watch(
      [
        // TODO: does this work on Windows?
        path.join(contentDir, `**/${FILES_FOLDER_NAME}/**/*`),
        path.join(contentDir, `**/${SOLUTION_FOLDER_NAME}/**/*`),
        templatesDir,
      ],
      {
        ignored: IGNORED_FILES,
        ignoreInitial: true,
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
      const result = await cache.canHandle(req.url);

      if (!result) {
        next();
        return;
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

    const filesMapFolders = await getAllFilesMap({ contentDir, templatesDir });

    const graph = await FilesMap.initGraph(filesMapFolders, logger);

    await Promise.all(
      filesMapFolders.map(async (folder) => {
        folder = path.normalize(folder);

        const filesRef = getFilesRef(folder, { contentDir, templatesDir });
        const dest = fileURLToPath(new URL(filesRef, dir));

        const fileMap = await graph.getFilesMapByFolder(folder)!.toFiles(logger);

        await fs.promises.writeFile(dest, JSON.stringify(fileMap));

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
