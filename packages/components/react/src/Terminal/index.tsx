import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { Terminal as XTerm, type ITheme } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';
import { useEffect, useRef } from 'react';
import { getTerminalTheme } from './theme.js';

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
      theme: getTerminalTheme(readonly ? { cursor: '#00000000' } : {}),
      fontSize: 13,
      fontFamily: 'Menlo, courier-new, courier, monospace',
    });

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

    // we render a transparent cursor in case the terminal is readonly
    terminal.options.theme = getTerminalTheme(readonly ? { cursor: '#00000000' } : {});
    terminal.options.disableStdin = readonly;
  }, [theme, readonly]);

  return <div className={`h-full ${className}`} ref={divRef} />;
}

export default Terminal;
