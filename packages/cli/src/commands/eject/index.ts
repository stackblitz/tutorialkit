import fs from 'node:fs';
import path from 'node:path';
import * as prompts from '@clack/prompts';
import chalk from 'chalk';
import detectIndent from 'detect-indent';
import { execa } from 'execa';
import whichpm from 'which-pm';
import type { Arguments } from 'yargs-parser';
import { pkg } from '../../pkg.js';
import { generateAstroConfig, parseAstroConfig, replaceArgs } from '../../utils/astro-config.js';
import { errorLabel, primaryLabel, printHelp } from '../../utils/messages.js';
import { updateWorkspaceVersions } from '../../utils/workspace-version.js';
import { DEFAULT_VALUES, type EjectOptions } from './options.js';

interface PackageJson {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

const TUTORIALKIT_VERSION = pkg.version;

const REQUIRED_DEPENDENCIES = [
  '@tutorialkit/runtime',
  '@webcontainer/api',
  'nanostores',
  '@nanostores/react',
  'kleur',
  '@stackblitz/sdk',
  'fast-glob',
];

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
          ['--defaults', 'Skip all the prompts and eject the routes using the defaults'],
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
   * and that there won't be any files overwritten in the process.
   *
   * If there are any and `force` was not specified we abort.
   */
  const { astroConfigPath, srcPath, pkgJsonPath, astroIntegrationPath, srcDestPath } = validateDestination(
    folderPath,
    flags.force,
  );

  /**
   * We proceed with the astro configuration.
   *
   * There we must disable the default routes so that the
   * new routes that we're copying will be automatically picked up.
   */
  const astroConfig = await parseAstroConfig(astroConfigPath);

  replaceArgs({ defaultRoutes: false }, astroConfig);

  fs.writeFileSync(astroConfigPath, generateAstroConfig(astroConfig));

  // we copy all assets from the `default` folder into the `src` folder
  fs.cpSync(srcPath, srcDestPath, { recursive: true });

  /**
   * Last, we ensure that the `package.json` contains the extra dependencies.
   * If any are missing we suggest to install the new dependencies.
   */
  const pkgJsonContent = fs.readFileSync(pkgJsonPath, 'utf-8');
  const indent = detectIndent(pkgJsonContent).indent || '  ';
  const pkgJson: PackageJson = JSON.parse(pkgJsonContent);

  const astroIntegrationPkgJson: PackageJson = JSON.parse(
    fs.readFileSync(path.join(astroIntegrationPath, 'package.json'), 'utf-8'),
  );

  const newDependencies = [];

  for (const dep of REQUIRED_DEPENDENCIES) {
    if (!(dep in pkgJson.dependencies) && !(dep in pkgJson.devDependencies)) {
      pkgJson.dependencies[dep] = astroIntegrationPkgJson.dependencies[dep];

      newDependencies.push(dep);
    }
  }

  updateWorkspaceVersions(pkgJson.dependencies, TUTORIALKIT_VERSION, (dependency) =>
    REQUIRED_DEPENDENCIES.includes(dependency),
  );

  if (newDependencies.length > 0) {
    fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, undefined, indent), { encoding: 'utf-8' });

    console.log(
      primaryLabel('INFO'),
      `New dependencies added: ${newDependencies.join(', ')}. Install the new dependencies before proceeding.`,
    );

    if (!flags.defaults) {
      const packageManager = (await whichpm(path.dirname(pkgJsonPath))).name;

      const answer = await prompts.confirm({
        message: `Do you want to install those dependencies now using ${chalk.blue(packageManager)}?`,
      });

      if (answer === true) {
        await execa(packageManager, ['install'], { cwd: folderPath, stdio: 'inherit' });
      }
    }
  }

  return 0;
}

function validateDestination(folder: string, force: boolean) {
  assertExists(folder);

  const pkgJsonPath = assertExists(path.join(folder, 'package.json'));
  const astroConfigPath = assertExists(path.join(folder, 'astro.config.ts'));
  const srcDestPath = assertExists(path.join(folder, 'src'));

  const astroIntegrationPath = assertExists(path.resolve(folder, 'node_modules', '@tutorialkit', 'astro'));

  const srcPath = path.join(astroIntegrationPath, 'dist', 'default');

  // check that there are no collision
  if (!force) {
    walk(srcPath, (relativePath) => {
      const destination = path.join(srcDestPath, relativePath);

      if (fs.existsSync(destination)) {
        throw new Error(
          `Eject aborted because '${destination}' would be overwritten by this command. Use ${chalk.yellow('--force')} to ignore this error.`,
        );
      }
    });
  }

  return {
    astroConfigPath,
    astroIntegrationPath,
    pkgJsonPath,
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
