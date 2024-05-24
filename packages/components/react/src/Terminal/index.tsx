import type { TutorialRunner } from '@tutorialkit/runtime';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { Terminal as XTerm } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';
import { useEffect, useRef } from 'react';
import { darkTheme, lightTheme } from './theme.js';

export interface Props {
  readonly?: boolean;
  tutorialRunner: TutorialRunner;
  theme: 'dark' | 'light';
}

export function Terminal({ tutorialRunner, theme, readonly = true }: Props) {
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
      disableStdin: false,
      theme: theme === 'dark' ? darkTheme : lightTheme,
      fontSize: 13,
      fontFamily: 'Menlo, courier-new, courier, monospace',
    });

    terminalRef.current = terminal;

    terminal.loadAddon(fitAddon);
    terminal.loadAddon(webLinksAddon);
    terminal.open(element);

    fitAddon.fit();

    tutorialRunner.hookTerminal(terminal);

    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
      tutorialRunner.onTerminalResize();
    });

    resizeObserver.observe(element);

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

  return <div className="h-full" ref={divRef} />;
}

export default Terminal;
