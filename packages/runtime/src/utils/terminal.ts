export interface ITerminal {
  readonly cols?: number;
  readonly rows?: number;

  reset: () => void;
  write: (data: string) => void;
  input: (data: string) => void;
  onData: (cb: (data: string) => void) => void;
}

const reset = '\x1b[0m';

export const escapeCodes = {
  reset,
  clear: '\x1b[g',
  red: (text: string) => `\x1b[1;31m${text}${reset}`,
  gray: (text: string) => `\x1b[37m${text}${reset}`,
  green: (text: string) => `\x1b[1;32m${text}${reset}`,
  magenta: (text: string) => `\x1b[35m${text}${reset}`,
};

export function clearTerminal(terminal?: ITerminal) {
  terminal?.reset();
  terminal?.write(escapeCodes.clear);
}
