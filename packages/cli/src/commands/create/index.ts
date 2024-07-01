import * as prompts from '@clack/prompts';
import chalk from 'chalk';
import { execa } from 'execa';
import fs from 'node:fs';
import path from 'node:path';
import yargs from 'yargs-parser';
import { pkg } from '../../pkg.js';
import { errorLabel, primaryLabel, printHelp, warnLabel } from '../../utils/messages.js';
import { generateProjectName } from '../../utils/project.js';
import { assertNotCanceled } from '../../utils/tasks.js';
import { setupEnterpriseConfig } from './enterprise.js';
import { initGitRepo } from './git.js';
import { installAndStart } from './install-start.js';
import { DEFAULT_VALUES, type CreateOptions } from './options.js';
import { selectPackageManager, type PackageManager } from './package-manager.js';
import { copyTemplate } from './template.js';

export async function createTutorial(flags: yargs.Arguments) {
  if (flags._[1] === 'help' || flags.help || flags.h) {
    printHelp({
      commandName: `${pkg.name} create`,
      usage: '[name] [...options]',
      tables: {
        Options: [
          ['--dir, -d', 'The folder in which the tutorial gets created'],
          ['--install, --no-install', `Install dependencies (default ${chalk.yellow(DEFAULT_VALUES.install)})`],
          ['--start, --no-start', `Start project (default ${chalk.yellow(DEFAULT_VALUES.start)})`],
          ['--git, --no-git', `Initialize a local git repository (default ${chalk.yellow(DEFAULT_VALUES.git)})`],
          ['--dry-run', `Walk through steps without executing (default ${chalk.yellow(DEFAULT_VALUES.dryRun)})`],
          [
            '--package-manager <name>, -p <name>',
            `The package used to install dependencies (default ${chalk.yellow(DEFAULT_VALUES.packageManager)})`,
          ],
          [
            '--enterprise <origin>, -e <origin>',
            `The origin of your StackBlitz Enterprise instance (if not provided authentication is not turned on and your project will use ${chalk.yellow('https://stackblitz.com')})`,
          ],
          [
            '--force',
            `Overwrite existing files in the target directory without prompting (default ${chalk.yellow(DEFAULT_VALUES.force)})`,
          ],
          ['--defaults', 'Skip all prompts and initialize the tutorial using the defaults'],
        ],
      },
    });

    return 0;
  }

  applyAliases(flags);

  try {
    verifyFlags(flags);
  } catch (error) {
    console.error(`${errorLabel()} ${error.message}`);

    process.exit(1);
  }

  try {
    return _createTutorial(flags);
  } catch (error) {
    console.error(`${errorLabel()} Command failed`);

    if (error.stack) {
      console.error(`\n${error.stack}`);
    }

    process.exit(1);
  }
}

async function _createTutorial(flags: CreateOptions): Promise<undefined> {
  prompts.intro(primaryLabel(pkg.name));

  let tutorialName = flags._[1] !== undefined ? String(flags._[1]) : undefined;

  if (tutorialName === undefined) {
    const randomName = generateProjectName();

    if (flags.defaults) {
      tutorialName = randomName;
    } else {
      const answer = await prompts.text({
        message: `What's the name of your tutorial?`,
        placeholder: randomName,
        validate: (value) => {
          if (!value) {
            return 'Please provide a name!';
          }

          return undefined;
        },
      });

      assertNotCanceled(answer);

      tutorialName = answer;
    }
  }

  prompts.log.info(`We'll call your tutorial ${chalk.blue(tutorialName)}`);

  const dest = await getTutorialDirectory(tutorialName, flags);
  const resolvedDest = path.resolve(process.cwd(), dest);

  prompts.log.info(`Scaffolding tutorial in ${chalk.blue(resolvedDest)}`);

  if (fs.existsSync(resolvedDest) && !flags.force) {
    if (flags.defaults) {
      console.error(`\n${errorLabel()} Failed to create tutorial. Directory already exists.`);
      process.exit(1);
    }

    let answer: boolean | symbol;

    if (fs.readdirSync(resolvedDest).length > 0) {
      answer = await prompts.confirm({
        message: `Directory is not empty. Continuing may overwrite existing files. Do you want to continue?`,
        initialValue: false,
      });
    } else {
      answer = await prompts.confirm({
        message: `Directory already exists. Continuing may overwrite existing files. Do you want to continue?`,
        initialValue: false,
      });
    }

    assertNotCanceled(answer);

    if (!answer) {
      exitEarly();
    }
  } else {
    if (!flags.dryRun) {
      // ensure destination exists
      fs.mkdirSync(resolvedDest, { recursive: true });
    }
  }

  await copyTemplate(resolvedDest, flags);

  updatePackageJson(resolvedDest, tutorialName, flags);

  const selectedPackageManager = await selectPackageManager(flags);

  updateReadme(resolvedDest, selectedPackageManager, flags);

  await setupEnterpriseConfig(resolvedDest, flags);

  await initGitRepo(resolvedDest, flags);

  const { install, start } = await installAndStart(flags);

  prompts.log.success(chalk.green('Tutorial successfully created!'));

  if (install || start) {
    let message = 'Please wait while we install the dependencies and start your project...';

    if (install && !start) {
      // change the message if we're only installing dependencies
      message = 'Please wait while we install the dependencies...';

      // print the next steps without the install step in case we only install dependencies
      printNextSteps(dest, selectedPackageManager, true);
    }

    prompts.outro(message);

    await startProject(resolvedDest, selectedPackageManager, flags, start);
  } else {
    printNextSteps(dest, selectedPackageManager, false);

    prompts.outro(`You're all set!`);

    console.log('Until next time 👋');
  }
}

async function startProject(cwd: string, packageManager: PackageManager, flags: CreateOptions, startProject: boolean) {
  if (flags.dryRun) {
    const message = startProject
      ? 'Skipped dependency installation and project start'
      : 'Skipped dependency installation';

    console.warn(`${warnLabel('DRY RUN')} ${message}`);
  } else {
    await execa(packageManager, ['install'], { cwd, stdio: 'inherit' });

    if (startProject) {
      await execa(packageManager, ['run', 'dev'], { cwd, stdio: 'inherit' });
    }
  }
}

async function getTutorialDirectory(tutorialName: string, flags: CreateOptions) {
  const dir = flags.dir;

  if (dir) {
    return dir;
  }

  if (flags.defaults) {
    return `./${tutorialName}`;
  }

  const promptResult = await prompts.text({
    message: 'Where should we create your new tutorial?',
    initialValue: `./${tutorialName}`,
    placeholder: './',
    validate(value) {
      if (!path.isAbsolute(value) && !value.startsWith('./')) {
        return 'Please provide an absolute or relative path!';
      }

      return undefined;
    },
  });

  assertNotCanceled(promptResult);

  return promptResult;
}

function printNextSteps(dest: string, packageManager: PackageManager, dependenciesInstalled: boolean) {
  let i = 0;

  prompts.log.message(chalk.bold.underline('Next Steps'));

  const steps: Array<[command: string | undefined, text: string, render?: boolean]> = [
    [`cd ${dest}`, 'Navigate to project'],
    [`${packageManager} install`, 'Install dependencies', !dependenciesInstalled],
    [`${packageManager} run dev`, 'Start development server'],
    [, `Head over to ${chalk.underline('http://localhost:4321')}`],
  ];

  for (const [command, text, render] of steps) {
    if (render === false) {
      continue;
    }

    i++;

    prompts.log.step(`${i}. ${command ? `${chalk.blue(command)} - ` : ''}${text}`);
  }
}

function updatePackageJson(dest: string, projectName: string, flags: CreateOptions) {
  if (flags.dryRun) {
    return;
  }

  const pkgPath = path.resolve(dest, 'package.json');
  const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

  pkgJson.name = projectName;

  fs.writeFileSync(pkgPath, JSON.stringify(pkgJson, undefined, 2));

  try {
    const pkgLockPath = path.resolve(dest, 'package-lock.json');
    const pkgLockJson = JSON.parse(fs.readFileSync(pkgLockPath, 'utf8'));
    const defaultPackage = pkgLockJson.packages[''];

    pkgLockJson.name = projectName;

    if (defaultPackage) {
      defaultPackage.name = projectName;
    }

    fs.writeFileSync(pkgLockPath, JSON.stringify(pkgLockJson, undefined, 2));
  } catch {
    // ignore any errors
  }
}

function updateReadme(dest: string, packageManager: PackageManager, flags: CreateOptions) {
  if (flags.dryRun) {
    return;
  }

  const readmePath = path.resolve(dest, 'README.md');

  let readme = fs.readFileSync(readmePath, 'utf8');

  // update placeholder for package manager
  readme = readme.replaceAll('<% pkgManager %>', packageManager ?? DEFAULT_VALUES.packageManager);

  fs.writeFileSync(readmePath, readme);
}

function exitEarly(exitCode = 0): never {
  prompts.outro('Until next time!');
  process.exit(exitCode);
}

function applyAliases(flags: CreateOptions & Record<string, any>) {
  if (flags.d) {
    flags.dir = flags.d;
  }

  if (flags.p) {
    flags.packageManager = flags.p;
  }

  if (flags.e) {
    flags.enterprise = flags.e;
  }
}

function verifyFlags(flags: CreateOptions) {
  if (flags.install === false && flags.start) {
    throw new Error('Cannot start project without installing dependencies.');
  }
}
