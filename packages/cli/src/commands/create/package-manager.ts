import fs from 'node:fs';
import path from 'node:path';
import * as prompts from '@clack/prompts';
import chalk from 'chalk';
import { lookpath } from 'lookpath';
import { assertNotCanceled } from '../../utils/tasks.js';
import { DEFAULT_VALUES, type CreateOptions } from './options.js';

export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';

const LOCK_FILES = new Map<PackageManager, string>([
  ['npm', 'package-lock.json'],
  ['pnpm', 'pnpm-lock.yaml'],
  ['yarn', 'yarn.lock'],
]);

export async function selectPackageManager(cwd: string, flags: CreateOptions) {
  const packageManager = await resolvePackageManager(flags);

  // remove lock files for other package managers
  for (const [pkgManager, lockFile] of LOCK_FILES) {
    if (pkgManager !== packageManager) {
      fs.rmSync(path.join(cwd, lockFile), { force: true });
    }
  }

  return packageManager;
}

async function resolvePackageManager(flags: CreateOptions) {
  if (flags.packageManager) {
    if (await lookpath(String(flags.packageManager))) {
      return flags.packageManager as PackageManager;
    }

    prompts.log.warn(
      `The specified package manager '${chalk.yellow(flags.packageManager)}' doesn't seem to be installed!`,
    );
  }

  if (flags.defaults) {
    return DEFAULT_VALUES.packageManager as PackageManager;
  }

  return await getPackageManager();
}

async function getPackageManager() {
  const installedPackageManagers = await getInstalledPackageManagers();

  let initialValue = process.env.npm_config_user_agent?.split('/')[0] as PackageManager | undefined;

  if (!installedPackageManagers.includes(initialValue)) {
    initialValue = 'npm';
  }

  const answer = await prompts.select({
    message: 'What package manager should we use?',
    initialValue,
    options: [
      { label: 'npm', value: 'npm' },
      ...installedPackageManagers.map((pkgManager) => {
        return { label: pkgManager, value: pkgManager };
      }),
    ],
  });

  assertNotCanceled(answer);

  return answer as PackageManager;
}

async function getInstalledPackageManagers(): Promise<PackageManager[]> {
  const packageManagers: PackageManager[] = [];

  for (const pkgManager of ['yarn', 'pnpm', 'bun']) {
    try {
      if (await lookpath(pkgManager)) {
        packageManagers.push(pkgManager as PackageManager);
      }
    } catch {
      // package manager not found, do nothing
    }
  }

  return packageManagers;
}
