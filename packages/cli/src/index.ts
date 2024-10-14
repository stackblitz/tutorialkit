#!/usr/bin/env node

import chalk from 'chalk';
import yargs from 'yargs-parser';
import { createTutorial } from './commands/create/index.js';
import { ejectRoutes } from './commands/eject/index.js';
import { pkg } from './pkg.js';
import { errorLabel, primaryLabel, printHelp } from './utils/messages.js';

type CLICommand = 'version' | 'help' | 'create' | 'eject';

const supportedCommands = new Set<string>(['version', 'help', 'create', 'eject'] satisfies CLICommand[]);

cli();

async function cli() {
  const flags = yargs(process.argv.slice(2));
  const cmd = resolveCommand(flags);

  try {
    // print newline
    console.log('');

    const exitCode = await runCommand(cmd, flags);

    process.exit(exitCode || 0);
  } catch (error) {
    console.error(`${errorLabel()} ${error.message}`);
    process.exit(1);
  }
}

async function runCommand(cmd: CLICommand, flags: yargs.Arguments): Promise<number | undefined> {
  switch (cmd) {
    case 'version': {
      console.log(`${primaryLabel(pkg.name)} ${chalk.green(`v${pkg.version}`)}`);
      return;
    }
    case 'help': {
      printHelp({
        commandName: pkg.name,
        prolog: `${primaryLabel(pkg.name)} ${chalk.green(`v${pkg.version}`)} Create tutorial apps powered by WebContainer API`,
        usage: ['[command] [...options]', '[ -h | --help | -v | --version ]'],
        tables: {
          Commands: [
            ['create', 'Create new tutorial app'],
            [
              'eject',
              'Move all default pages and components into your project, providing full control over the Astro app',
            ],
            ['help', 'Show this help message'],
          ],
        },
      });

      return;
    }
    case 'create': {
      return createTutorial(flags);
    }
    case 'eject': {
      return ejectRoutes(flags);
    }
    default: {
      console.error(`${errorLabel()} Unknown command ${chalk.red(cmd)}`);
      return 1;
    }
  }
}

function resolveCommand(flags: yargs.Arguments): CLICommand {
  if (flags.version || flags.v) {
    return 'version';
  }

  if (flags._[0] == null && (flags.help || flags.h)) {
    return 'help';
  }

  const cmd = String(flags._.at(0));

  if (!supportedCommands.has(cmd)) {
    return 'help';
  }

  return cmd as CLICommand;
}
