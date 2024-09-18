import fs from 'node:fs';
import path from 'node:path';
import * as prompts from '@clack/prompts';
import chalk from 'chalk';
import { pkg } from '../../pkg.js';
import { warnLabel } from '../../utils/messages.js';
import { runShellCommand } from '../../utils/shell.js';
import { assertNotCanceled, runTask } from '../../utils/tasks.js';
import { DEFAULT_VALUES, readFlag, type CreateOptions } from './options.js';

export async function initGitRepo(cwd: string, flags: CreateOptions) {
  let shouldInitGitRepo = readFlag(flags, 'git');

  if (shouldInitGitRepo === undefined) {
    const answer = await prompts.confirm({
      message: 'Initialize a new git repository?',
      initialValue: DEFAULT_VALUES.git,
    });

    assertNotCanceled(answer);

    shouldInitGitRepo = answer;
  }

  if (shouldInitGitRepo) {
    await runTask({
      title: 'Initializing git repository',
      dryRun: flags.dryRun,
      dryRunMessage: `${warnLabel('DRY RUN')} Skipped initializing git repository`,
      task: async () => {
        const message = await _initGitRepo(cwd);
        return message ?? 'Git repository initialized';
      },
    });
  } else {
    prompts.log.message(`${chalk.blue('git [skip]')} You can always run ${chalk.yellow('git init')} manually.`);
  }
}

async function _initGitRepo(cwd: string) {
  if (fs.existsSync(path.join(cwd, '.git'))) {
    return `${chalk.cyan('Nice!')} Git has already been initialized`;
  }

  try {
    // initialize git repo
    await runShellCommand('git', ['init'], { cwd, stdio: 'ignore' });

    // stage all files
    await runShellCommand('git', ['add', '-A'], { cwd, stdio: 'ignore' });

    // create first commit
    await runShellCommand(
      'git',
      ['commit', '-m', `"feat: initial commit from ${pkg.name}"`, '--author="StackBlitz <hello@stackblitz.com>"'],
      {
        cwd,
        stdio: 'ignore',
      },
    );

    return undefined;
  } catch {
    throw new Error('Failed to initialize local git repository');
  }
}
