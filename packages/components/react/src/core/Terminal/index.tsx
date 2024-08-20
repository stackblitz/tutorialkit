import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { Terminal as XTerm } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';
import { forwardRef, useEffect, useImperativeHandle, useRef, type ComponentProps } from 'react';
import '../../styles/terminal.css';
import { getTerminalTheme } from './theme.js';

export interface TerminalRef {
  reloadStyles: () => void;
}

export interface TerminalProps extends ComponentProps<'div'> {
  theme: 'dark' | 'light';
  readonly?: boolean;
  onTerminalReady?: (terminal: XTerm) => void;
  onTerminalResize?: (cols: number, rows: number) => void;
}

export const Terminal = forwardRef<TerminalRef, TerminalProps>(
  ({ theme, readonly = true, onTerminalReady, onTerminalResize, ...props }, ref) => {
    const divRef = useRef<HTMLDivElement>(null);
    const terminalRef = useRef<XTerm>();

    useEffect(() => {
      const element = divRef.current!;

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
      const terminal = terminalRef.current!;

      // we render a transparent cursor in case the terminal is readonly
      terminal.options.theme = getTerminalTheme(readonly ? { cursor: '#00000000' } : {});
      terminal.options.disableStdin = readonly;
    }, [theme, readonly]);

    useImperativeHandle(ref, () => {
      return {
        reloadStyles: () => {
          const terminal = terminalRef.current!;

          terminal.options.theme = getTerminalTheme(readonly ? { cursor: '#00000000' } : {});
        },
      };
    }, []);

    return <div {...props} ref={divRef} />;
  },
);

Terminal.displayName = 'Terminal';
export default Terminal;
