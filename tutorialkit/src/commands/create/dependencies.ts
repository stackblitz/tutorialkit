import * as prompts from '@clack/prompts';
import chalk from 'chalk';
import { lookpath } from 'lookpath';
import { warnLabel } from '../../utils/messages';
import { runShellCommand } from '../../utils/shell';
import { assertNotCanceled, runTask } from '../../utils/tasks';
import { DEFAULT_VALUES, type CreateOptions } from './options';

export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';

export async function installDependencies(cwd: string, flags: CreateOptions) {
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
  let selectedPackageManager = (flags.packageManager ?? DEFAULT_VALUES.packageManager) as PackageManager;

  if (installDeps) {
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

    selectedPackageManager = packageManager;

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

  return { selectedPackageManager, dependenciesInstalled };
}

async function getPackageManager() {
  const installedPackageManagers = await getInstalledPackageManagers();

  const answer = await prompts.select({
    message: 'What package manager should we use?',
    initialValue: 'pnpm',
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
    } catch (error) {
      // package manager not found, do nothing
    }
  }

  return packageManagers;
}
