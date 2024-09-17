import fs from 'node:fs';
import path from 'node:path';
import type { AstroIntegrationLogger } from 'astro';
import glob from 'fast-glob';
import { z } from 'zod';
import type { Files } from '../types';
import { EXTEND_CONFIG_FILEPATH, IGNORED_FILES } from './constants';

const configSchema = z
  .object({
    extends: z.string(),
  })
  .strict();

export class FilesMapGraph {
  constructor(private _nodes = new Map<string, FilesMap>()) {}

  getFilesMapByFolder(folder: string) {
    try {
      const resolvedPath = fs.realpathSync(folder);

      return this._nodes.get(resolvedPath);
    } catch {
      return undefined;
    }
  }

  allFilesMap() {
    return this._nodes.values();
  }

  updateFilesMapByFolder(folder: string, logger: AstroIntegrationLogger) {
    const resolvedPath = fs.realpathSync(folder);

    let node = this._nodes.get(resolvedPath);

    if (!node) {
      node = new FilesMap(resolvedPath);
      this._nodes.set(resolvedPath, node);
    }

    node.update(this._nodes, logger);
  }
}

export class FilesMap {
  /**
   * Initialize the graph of nodes by connecting them to one another.
   * The graph is expected to be acyclic but this function won't throw any
   * exception if it isn't.
   *
   * Instead when a `FilesMap` is turned into a JSON file, a warning will be
   * printed if a cycle is found.
   *
   * @param folders initial folders found after a lookup.
   */
  static async initGraph(folders: string[], logger: AstroIntegrationLogger): Promise<FilesMapGraph> {
    const nodes = new Map<string, FilesMap>();

    const resolvedPaths = await Promise.all(folders.map((folder) => fs.promises.realpath(folder)));

    for (const resolvedPath of resolvedPaths) {
      nodes.set(resolvedPath, new FilesMap(resolvedPath));
    }

    for (const node of nodes.values()) {
      node.update(nodes, logger);
    }

    return new FilesMapGraph(nodes);
  }

  private _extend: FilesMap | null = null;
  private _dependents: Set<FilesMap> = new Set<FilesMap>();

  /**
   * Construct a new FileMap. To connect it to its graph, call
   * `FileMap.initGraph` or `init(graph)`.
   *
   * @param path resolved path of this file map.
   */
  constructor(readonly path: string) {}

  update(graph: Map<string, FilesMap>, logger: AstroIntegrationLogger) {
    const configPath = path.join(this.path, EXTEND_CONFIG_FILEPATH);

    if (!fs.existsSync(configPath)) {
      this.unlink();
      return;
    }

    try {
      const jsonConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      const config = configSchema.parse(jsonConfig);

      /**
       * Note: in the future we could also use require.resolve to be able to depend
       *       on a template that is `node_modules`.
       */
      const dependOnPath = fs.realpathSync(path.join(this.path, config.extends));
      let dependOn = graph.get(dependOnPath);

      if (!dependOn) {
        dependOn = new FilesMap(dependOnPath);
        graph.set(dependOnPath, dependOn);
        dependOn.update(graph, logger);
      }

      this.extend(dependOn);
    } catch (error: any) {
      logger.warn(`Failed to parse '${configPath}', content won't be included.\nError: ${error}`);
    }
  }

  extend(other: FilesMap) {
    this.unlink();
    other._dependents.add(this);
    this._extend = other;
  }

  unlink() {
    this._extend?._dependents.delete(this);
    this._extend = null;
  }

  *allDependents(): Generator<FilesMap> {
    for (const dependency of this._dependents) {
      yield dependency;

      yield* dependency.allDependents();
    }
  }

  async toFiles(logger: AstroIntegrationLogger): Promise<Files> {
    const filePathsObj = await this._toFilePathsCheckCycles({
      logger,
      visitedNodes: [],
    });

    delete filePathsObj[EXTEND_CONFIG_FILEPATH];

    const filePaths = Object.entries(filePathsObj);

    filePaths.sort();

    const files: Files = {};

    for (const [webcontainerPath, filePath] of filePaths) {
      const buffer = fs.readFileSync(filePath);

      try {
        const stringContent = new TextDecoder('utf-8', { fatal: true }).decode(buffer);

        files[webcontainerPath] = stringContent;
      } catch {
        files[webcontainerPath] = { base64: buffer.toString('base64') };
      }
    }

    return files;
  }

  private async _toFilePathsCheckCycles(context: CheckCycleContext): Promise<FilePaths> {
    const seenIndex = context.visitedNodes.indexOf(this.path);

    if (seenIndex !== -1) {
      context.logger.warn(
        [
          'Cycle detected:',
          ...context.visitedNodes.map((filePath, index) => {
            return `  * '${filePath}' ${index === seenIndex ? '<-- Cycle points back to that file' : ''}`;
          }),
          'Content will be ignored after that point.',
        ].join('\n'),
      );

      return {};
    }

    context.visitedNodes.push(this.path);

    const filePaths: FilePaths = this._extend ? await this._extend._toFilePathsCheckCycles(context) : {};

    await getAllFiles(this.path, filePaths);

    return filePaths;
  }
}

interface CheckCycleContext {
  logger: AstroIntegrationLogger;
  visitedNodes: string[];
}

type FilePaths = { [webcontainerPath: string]: /* filePath: */ string };

async function getAllFiles(dir: string, result: FilePaths): Promise<void> {
  const filePaths = await glob(`${glob.convertPathToPattern(dir)}/**/*`, {
    onlyFiles: true,
    dot: true,
    ignore: IGNORED_FILES,
  });

  for (const filePath of filePaths) {
    result[webcontainerPath(dir, filePath)] = filePath;
  }
}

function webcontainerPath(dir: string, filePath: string) {
  const result = `/${path.relative(dir, filePath)}`;

  // normalize path separators
  if (path.sep !== '/') {
    return result.replaceAll(path.sep, '/');
  }

  return result;
}
