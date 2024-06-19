import chalk from 'chalk';
import fs from 'node:fs';
import path from 'node:path';
import type { Arguments } from 'yargs-parser';
import { pkg } from '../../pkg.js';
import { DEFAULT_VALUES, type EjectOptions } from './options.js';
import { errorLabel, printHelp } from '../../utils/messages.js';
import { parseAstroConfig, replaceArgs, generateAstroConfig } from '../../utils/astro-config.js';

export function ejectRoutes(flags: Arguments) {
  if (flags._[1] === 'help' || flags.help || flags.h) {
    printHelp({
      commandName: `${pkg.name} eject`,
      usage: '[folder] [...options]',
      tables: {
        Options: [
          [
            '--force',
            `Overwrite existing files in the target directory without prompting (default ${chalk.yellow(DEFAULT_VALUES.force)})`,
          ],
        ],
      },
    });

    return 0;
  }

  try {
    return _eject(flags);
  } catch (error) {
    console.error(`${errorLabel()} Command failed`);

    if (error.stack) {
      console.error(`\n${error.stack}`);
    }

    process.exit(1);
  }
}

async function _eject(flags: EjectOptions) {
  let folderPath = flags._[1] !== undefined ? String(flags._[1]) : undefined;

  if (folderPath === undefined) {
    folderPath = process.cwd();
  } else {
    folderPath = path.resolve(process.cwd(), folderPath);
  }

  /**
   * First we make sure that the destination has the correct files
   * and that there won't be any files overriden in the process.
   *
   * If they are any and `force` was not specified we abort.
   */
  const { astroConfigPath, srcPath, srcDestPath } = validateDestination(folderPath, flags.force);

  /**
   * We now proceed with the astro configuration.
   *
   * There we must disable the default routes so that the
   * new routes that we're copying will be automatically picked up.
   */
  const astroConfig = await parseAstroConfig(astroConfigPath);

  replaceArgs({ defaultRoutes: false }, astroConfig);

  fs.writeFileSync(astroConfigPath, generateAstroConfig(astroConfig));

  /**
   * We now finalize by copying all the assets from the `default` folder
   * into the `src` folder.
   */
  fs.cpSync(srcPath, srcDestPath, { recursive: true });
}

function validateDestination(folder: string, force: boolean) {
  assertExists(folder);

  const astroConfigPath = assertExists(path.join(folder, 'astro.config.ts'));
  const srcDestPath = assertExists(path.join(folder, 'src'));

  const localAstroIntegration = assertExists(path.resolve(folder, 'node_modules', '@tutorialkit', 'astro'));

  const srcPath = path.join(localAstroIntegration, 'dist', 'default');

  // check that they are no collision
  if (!force) {
    walk(srcPath, (relativePath) => {
      const destination = path.join(srcDestPath, relativePath);

      if (fs.existsSync(destination)) {
        throw new Error(
          `Eject aborted because '${destination}' would be overriden by this command. Use --force to ignore this error.`,
        );
      }
    });
  }

  return {
    astroConfigPath,
    srcPath,
    srcDestPath,
  };
}

function assertExists(filePath: string) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${filePath} does not exists!`);
  }

  return filePath;
}

function walk(root: string, visit: (relativeFilePath: string) => void) {
  function traverse(folder: string, pathPrefix: string) {
    for (const filename of fs.readdirSync(folder)) {
      const filePath = path.join(folder, filename);
      const stat = fs.statSync(filePath);

      const relativeFilePath = path.join(pathPrefix, filename);

      if (stat.isDirectory()) {
        traverse(filePath, relativeFilePath);
      } else {
        visit(relativeFilePath);
      }
    }
  }

  traverse(root, '');
}
