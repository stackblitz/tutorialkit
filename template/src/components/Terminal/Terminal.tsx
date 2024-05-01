import { themeIsDark, themeStore } from '@stores/theme-store';
import '@styles/xterm.css';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { Terminal as XTerm } from '@xterm/xterm';
import { useContext, useEffect, useRef } from 'react';
import { TutorialRunnerContext } from '../webcontainer/tutorial-runner';
import { darkTheme, lightTheme } from './theme';

interface Props {
  readonly?: boolean;
}

export function Terminal({ readonly = true }: Props) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const tutorialRunner = useContext(TutorialRunnerContext);

  useEffect(() => {
    if (!terminalRef.current) {
      console.error('Terminal reference undefined');
      return;
    }

    const element = terminalRef.current;

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    const terminal = new XTerm({
      cursorBlink: true,
      convertEol: true,
      disableStdin: false,
      theme: themeIsDark() ? darkTheme : lightTheme,
      fontSize: 13,
      fontFamily: 'Menlo, courier-new, courier, monospace',
    });

    const unsubscribeFromThemeStore = themeStore.subscribe(() => {
      terminal.options.theme = themeIsDark() ? darkTheme : lightTheme;
    });

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
      unsubscribeFromThemeStore();
      resizeObserver.disconnect();
      terminal.dispose();
    };
  }, []);

  return <div className="h-full" ref={terminalRef} />;
}

export default Terminal;
