import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { Terminal as XTerm } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';
import { useEffect, useRef } from 'react';
import { darkTheme, lightTheme } from './theme.js';

export interface Props {
  theme: 'dark' | 'light';
  className?: string;
  readonly?: boolean;
  onTerminalReady?: (terminal: XTerm) => void;
  onTerminalResize?: (cols: number, rows: number) => void;
}

export function Terminal({ theme, className, readonly = true, onTerminalReady, onTerminalResize }: Props) {
  const divRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<XTerm>();

  useEffect(() => {
    if (!divRef.current) {
      console.error('Terminal reference undefined');
      return;
    }

    const element = divRef.current;

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    const terminal = new XTerm({
      cursorBlink: true,
      convertEol: true,
      disableStdin: readonly,
      theme: theme === 'dark' ? darkTheme : lightTheme,
      fontSize: 13,
      fontFamily: 'Menlo, courier-new, courier, monospace',
    });

    if (readonly) {
      // write DECTCEM to the terminal to hide the cursor if we are in readonly mode
      terminal.write('\x1b[?25l');
    }

    terminalRef.current = terminal;

    terminal.loadAddon(fitAddon);
    terminal.loadAddon(webLinksAddon);
    terminal.open(element);

    fitAddon.fit();

    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
      onTerminalResize?.(terminal.cols, terminal.rows);
    });

    resizeObserver.observe(element);

    onTerminalReady?.(terminal);

    return () => {
      resizeObserver.disconnect();
      terminal.dispose();
    };
  }, []);

  useEffect(() => {
    if (!terminalRef.current) {
      return;
    }

    const terminal = terminalRef.current;

    terminal.options.theme = theme === 'dark' ? darkTheme : lightTheme;
  }, [theme]);

  return <div className={`h-full ${className}`} ref={divRef} />;
}

export default Terminal;
