import '@styles/xterm.css';
import { FitAddon } from '@xterm/addon-fit';
import { Terminal as XTerm } from '@xterm/xterm';
import { useEffect, useRef } from 'react';
import { darkTheme } from './theme';

export default function Terminal() {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!terminalRef.current) {
      console.error('Terminal reference undefined');
      return;
    }

    const element = terminalRef.current;

    const fitAddon = new FitAddon();

    const terminal = new XTerm({
      cursorBlink: true,
      convertEol: true,
      disableStdin: false,
      theme: darkTheme,
      fontSize: 13,
      fontFamily: 'Menlo, courier-new, courier, monospace',
    });

    terminal.loadAddon(fitAddon);
    terminal.open(element);

    terminal.write('Terminal');

    const resizeObserver = new ResizeObserver(() => fitAddon.fit());
    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
      terminal.dispose();
    };
  }, []);

  return <div className="h-full" ref={terminalRef} />;
}
