import chalk from 'chalk';
import { primaryBlue } from './colors.js';

interface HelpOptions {
  commandName: string;
  usage?: string | string[];
  tables?: Record<string, [command: string, description: string | string[]][]>;
  prolog?: string;
  epilog?: string;
}

export function primaryLabel(text: string) {
  return primaryBlue(` ${chalk.whiteBright(text)} `);
}

export function errorLabel(text?: string) {
  return chalk.bgRed(` ${chalk.white(text ?? 'ERROR')} `);
}

export function warnLabel(text?: string) {
  return chalk.bgYellow(` ${chalk.black(text ?? 'WARN')} `);
}

export function printHelp({ commandName, usage, tables, prolog, epilog }: HelpOptions) {
  const helpMessage = [];

  let printNewline = false;

  if (prolog) {
    helpMessage.push(prolog);
    printNewline = true;
  }

  if (usage) {
    if (printNewline) {
      helpMessage.push('');
    }

    printNewline = true;

    const _usage = Array.isArray(usage) ? usage : [usage];
    const label = 'Usage:';
    const indentation = ' '.repeat(label.length + 1);

    helpMessage.push(`${chalk.bold.underline(label)} ${chalk.green(commandName)} ${chalk.bold(_usage[0])}`);

    for (const usageLines of _usage.slice(1)) {
      helpMessage.push(`${indentation}${chalk.green(commandName)} ${chalk.bold(usageLines)}`);
    }
  }

  if (tables) {
    let i = 0;

    const tableEntries = Object.entries(tables);

    if (tableEntries.length > 0 && printNewline) {
      helpMessage.push('');

      printNewline = true;
    }

    for (const [sectionTitle, tableRows] of tableEntries) {
      const padding = Object.values(tableRows).reduce((maxLength, table) => {
        const title = table[0];

        if (title.length > maxLength) {
          return title.length;
        }

        return maxLength;
      }, 0);

      helpMessage.push(chalk.bold.underline(`${sectionTitle}:`));

      for (const row of tableRows) {
        const [command, description] = row;
        helpMessage.push(`  ${command.padEnd(padding, ' ')}  ${chalk.dim(description)}`);
      }

      if (i++ < tableEntries.length - 1) {
        helpMessage.push('');
      }
    }
  }

  if (epilog) {
    if (printNewline) {
      helpMessage.push('');
    }

    helpMessage.push(epilog);
  }

  console.log(helpMessage.join('\n'));
}
