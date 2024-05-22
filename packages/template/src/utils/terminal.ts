const reset = '\x1b[0m';

export const escapeCodes = {
  reset,
  clear: '\x1b[g',
  red: (text: string) => `\x1b[1;31m${text}${reset}`,
  gray: (text: string) => `\x1b[37m${text}${reset}`,
  green: (text: string) => `\x1b[1;32m${text}${reset}`,
  magenta: (text: string) => `\x1b[35m${text}${reset}`,
};
