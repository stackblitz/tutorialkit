import type { ITheme } from '@xterm/xterm';

const style = getComputedStyle(document.documentElement);
const cssVar = (token: string) => style.getPropertyValue(token) || undefined;

export function getTerminalTheme(overrides?: ITheme): ITheme {
  return {
    cursor: cssVar('--tk-elements-terminal-cursorColor'),
    cursorAccent: cssVar('--tk-elements-terminal-cursorColorAccent'),
    foreground: cssVar('--tk-elements-terminal-textColor'),
    background: cssVar('--tk-elements-terminal-backgroundColor'),
    selectionBackground: cssVar('--tk-elements-terminal-selection-backgroundColor'),
    selectionForeground: cssVar('--tk-elements-terminal-selection-textColor'),
    selectionInactiveBackground: cssVar('--tk-elements-terminal-selection-backgroundColorInactive'),

    // ansi escape code colors
    black: cssVar('--tk-elements-terminal-color-black'),
    red: cssVar('--tk-elements-terminal-color-red'),
    green: cssVar('--tk-elements-terminal-color-green'),
    yellow: cssVar('--tk-elements-terminal-color-yellow'),
    blue: cssVar('--tk-elements-terminal-color-blue'),
    magenta: cssVar('--tk-elements-terminal-color-magenta'),
    cyan: cssVar('--tk-elements-terminal-color-cyan'),
    white: cssVar('--tk-elements-terminal-color-white'),
    brightBlack: cssVar('--tk-elements-terminal-color-brightBlack'),
    brightRed: cssVar('--tk-elements-terminal-color-brightRed'),
    brightGreen: cssVar('--tk-elements-terminal-color-brightGreen'),
    brightYellow: cssVar('--tk-elements-terminal-color-brightYellow'),
    brightBlue: cssVar('--tk-elements-terminal-color-brightBlue'),
    brightMagenta: cssVar('--tk-elements-terminal-color-brightMagenta'),
    brightCyan: cssVar('--tk-elements-terminal-color-brightCyan'),
    brightWhite: cssVar('--tk-elements-terminal-color-brightWhite'),

    ...overrides,
  };
}
