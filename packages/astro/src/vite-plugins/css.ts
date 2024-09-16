/**
 * A plugin that automatically adds user land CSS if they have any, particularly
 * useful to override the CSS variables of the theme.
 *
 * It exposes a virtual module `@tutorialkit/css` which is imported manually in
 * the correct location to make sure the CSS customization are added after the
 * default values.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import type { AstroIntegrationLogger } from 'astro';
import { watch } from 'chokidar';
import type { ViteDevServer, VitePlugin } from '../types.js';

const CUSTOM_PATHS = ['theme.css', 'theme/index.css'];

const virtualModuleId = '@tutorialkit/custom.css';
const resolvedVirtualModuleId = `/${virtualModuleId}`;

let projectRoot = process.cwd();

export const userlandCSS: VitePlugin = {
  name: '@tutorialkit/custom.css',
  resolveId(id) {
    if (id === virtualModuleId) {
      return resolvedVirtualModuleId;
    }

    return undefined;
  },
  configResolved({ root }) {
    projectRoot = root;
  },
  async load(id) {
    if (id === resolvedVirtualModuleId) {
      const path = await findCustomCSSFilePath(projectRoot);

      if (path) {
        return `@import '${path}';`;
      } else {
        return '';
      }
    }

    return undefined;
  },
};

export function watchUserlandCSS(server: ViteDevServer, logger: AstroIntegrationLogger) {
  const projectRoot = server.config.root;

  const watchedNames = new Map<string, boolean>(CUSTOM_PATHS.map((path) => [path, false] as const));

  const watcher = watch(projectRoot, {
    ignoreInitial: true,
    cwd: projectRoot,
    depth: 2,
    ignored: ['dist', 'src', 'node_modules'],
  });

  watcher.on('all', (eventName, filePath) => {
    if (eventName === 'addDir' || eventName === 'unlinkDir' || !watchedNames.has(filePath)) {
      return;
    }

    watchedNames.set(filePath, eventName !== 'unlink');

    checkConflicts(watchedNames, logger);

    const module = server.moduleGraph.getModuleById(resolvedVirtualModuleId);

    if (module) {
      server.reloadModule(module);
    }
  });
}

async function findCustomCSSFilePath(projectRoot: string): Promise<string | undefined> {
  for (const cssFilePath of CUSTOM_PATHS) {
    try {
      const stats = await fs.stat(path.join(projectRoot, cssFilePath));

      if (stats.isFile()) {
        return path.resolve(cssFilePath);
      }
    } catch {
      // ignore error
    }
  }

  return undefined;
}

function checkConflicts(watchedNames: Map<string, boolean>, logger: AstroIntegrationLogger) {
  const conflictCount = [...watchedNames.values()].reduce((count, value) => (value ? count + 1 : count), 0);

  // check for conflicting names, only one css file is injected
  if (conflictCount > 1) {
    let errorMessage = '';
    let index = 0;

    const lastIndex = conflictCount - 1;

    for (const [configName, isPresent] of watchedNames.entries()) {
      if (isPresent) {
        if (index === 0) {
          errorMessage = `File '${configName}' takes precedences over`;
        } else if (index === 1) {
          errorMessage += ` '${configName}'${index === lastIndex ? '.' : ''}`;
        } else if (index !== lastIndex) {
          errorMessage += `, '${configName}'`;
        } else {
          errorMessage += ` and '${configName}'.`;
        }

        index += 1;
      }
    }

    errorMessage += ' You might want to remove one of those files.';

    logger.warn(errorMessage);
  }
}
