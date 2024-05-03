import * as prompts from '@clack/prompts';
import chalk from 'chalk';
import fs from 'node:fs';
import path from 'node:path';
import yargs from 'yargs-parser';
import { pkg } from '../../pkg';
import { errorLabel, primaryLabel, printHelp } from '../../utils/messages';
import { generateProjectName } from '../../utils/project';
import { assertNotCanceled } from '../../utils/tasks';
import { installDependencies, type PackageManager } from './dependencies';
import { initGitRepo } from './git';
import { DEFAULT_VALUES, type CreateOptions } from './options';
import { copyTemplate } from './template';

export async function createTutorial(flags: yargs.Arguments) {
  if (flags._[1] === 'help' || flags.help || flags.h) {
    printHelp({
      commandName: `${pkg.name} create`,
      usage: '[name] [...options]',
      tables: {
        Options: [
          ['--dir, -d', 'The folder in which the tutorial gets created'],
          ['--install, --no-install', `Install dependencies (default ${chalk.yellow(DEFAULT_VALUES.install)})`],
          ['--git, --no-git', `Initialize a local git repository (default ${chalk.yellow(DEFAULT_VALUES.git)})`],
          ['--dry-run', `Walk through steps without executing (default ${chalk.yellow(DEFAULT_VALUES.dryRun)})`],
          [
            '--package-manager <name>, -p <name>',
            `The package used to install dependencies (default ${chalk.yellow(DEFAULT_VALUES.packageManager)})`,
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

async function _createTutorial(flags: CreateOptions) {
  applyAliases(flags);

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
      return process.exit(1);
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
      return exitEarly();
    }
  } else {
    if (!flags.dryRun) {
      // ensure destination exists
      fs.mkdirSync(resolvedDest, { recursive: true });
    }
  }

  await copyTemplate(resolvedDest, flags);

  const { selectedPackageManager, dependenciesInstalled } = await installDependencies(resolvedDest, flags);

  updateProjectName(resolvedDest, tutorialName, flags);
  updateReadme(resolvedDest, selectedPackageManager, flags);

  await initGitRepo(resolvedDest, flags);

  prompts.log.success(chalk.green('Tutorial successfully created!'));

  printNextSteps(dest, selectedPackageManager, dependenciesInstalled);

  prompts.outro(`You're all set!`);

  console.log('Until next time 👋');
}

async function getTutorialDirectory(projectName: string, flags: CreateOptions) {
  let dir = flags.dir;

  if (dir) {
    return dir;
  }

  if (flags.defaults) {
    return `./${projectName}`;
  }

  const promptResult = await prompts.text({
    message: 'Where should we create your new tutorial?',
    initialValue: `./${projectName}`,
    placeholder: './',
    validate(value) {
      if (!path.isAbsolute(value) && !value.startsWith('./')) {
        return 'Please provide an absolute or relative path!';
      }
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

function updateProjectName(dest: string, projectName: string, flags: CreateOptions) {
  if (flags.dryRun) {
    return;
  }

  const pkgPath = path.resolve(dest, 'package.json');

  const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

  pkgJson.name = projectName;

  fs.writeFileSync(pkgPath, JSON.stringify(pkgJson, undefined, 2));
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

function exitEarly(exitCode = 0) {
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
}
