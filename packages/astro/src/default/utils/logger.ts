/**
 * Largely taken from Astro logger implementation.
 *
 * @see https://github.com/withastro/astro/blob/c44f7f4babbb19350cd673241136bc974b012d51/packages/astro/src/core/logger/core.ts#L200
 */

import { blue, bold, dim, red, yellow } from 'kleur/colors';

const dateTimeFormat = new Intl.DateTimeFormat([], {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

function getEventPrefix(level: 'info' | 'error' | 'warn', label: string) {
  const timestamp = `${dateTimeFormat.format(new Date())}`;
  const prefix = [];

  if (level === 'error' || level === 'warn') {
    prefix.push(bold(timestamp));
    prefix.push(`[${level.toUpperCase()}]`);
  } else {
    prefix.push(timestamp);
  }

  if (label) {
    prefix.push(`[${label}]`);
  }

  if (level === 'error') {
    return red(prefix.join(' '));
  }

  if (level === 'warn') {
    return yellow(prefix.join(' '));
  }

  if (prefix.length === 1) {
    return dim(prefix[0]);
  }

  return dim(prefix[0]) + ' ' + blue(prefix.splice(1).join(' '));
}

export const logger = {
  warn(message: string) {
    console.log(getEventPrefix('warn', 'tutorialkit') + ' ' + message);
  },
  error(message: string) {
    console.error(getEventPrefix('error', 'tutorialkit') + ' ' + message);
  },
  info(message: string) {
    console.log(getEventPrefix('info', 'tutorialkit') + ' ' + message);
  },
};
