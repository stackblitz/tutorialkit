import fs from 'node:fs';
import path from 'node:path';
import * as prompts from '@clack/prompts';
import chalk from 'chalk';
import { lookpath } from 'lookpath';
import { warnLabel } from '../../utils/messages.js';
import { runShellCommand } from '../../utils/shell.js';
import { assertNotCanceled, runTask } from '../../utils/tasks.js';
import { DEFAULT_VALUES, type CreateOptions } from './options.js';

const LOCK_FILES = new Map<PackageManager, string>([
  ['npm', 'package-lock.json'],
  ['pnpm', 'pnpm-lock.yaml'],
  ['yarn', 'yarn.lock'],
]);

export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';

export async function installDependencies(cwd: string, flags: CreateOptions) {
  let packageManager: PackageManager;

  if (flags.packageManager) {
    if (await lookpath(String(flags.packageManager))) {
      packageManager = flags.packageManager as PackageManager;
    } else {
      prompts.log.warn(
        `The specified package manager '${chalk.yellow(flags.packageManager)}' doesn't seem to be installed!`,
      );
    }
  }

  if (!packageManager) {
    if (flags.defaults) {
      packageManager = DEFAULT_VALUES.packageManager as PackageManager;
    } else {
      packageManager = await getPackageManager();
    }
  }

  // remove lock files for other package managers
  for (const [pkgManager, lockFile] of LOCK_FILES) {
    if (pkgManager !== packageManager) {
      fs.rmSync(path.join(cwd, lockFile), { force: true });
    }
  }

  let installDeps = flags.install ?? DEFAULT_VALUES.install;

  if (!flags.defaults && flags.install === undefined) {
    const answer = await prompts.confirm({
      message: 'Install dependencies?',
      initialValue: DEFAULT_VALUES.install,
    });

    assertNotCanceled(answer);

    installDeps = answer;
  }

  let dependenciesInstalled = false;

  if (installDeps) {
    await runTask({
      title: `Installing dependencies with ${packageManager}`,
      dryRun: flags.dryRun,
      dryRunMessage: `${warnLabel('DRY RUN')} Skipped dependency installation`,
      task: async () => {
        try {
          await runShellCommand(packageManager, ['install'], { cwd, stdio: 'ignore' });

          dependenciesInstalled = true;

          return 'Dependencies installed';
        } catch {
          const installCommand = chalk.yellow(`${packageManager} install`);

          throw new Error(`Failed to install dependencies. Please run ${installCommand} manually after the setup.`);
        }
      },
    });
  } else {
    prompts.log.message(`${chalk.blue('dependencies [skip]')} Remember to install the dependencies after the setup.`);
  }

  return { selectedPackageManager: packageManager, dependenciesInstalled };
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
