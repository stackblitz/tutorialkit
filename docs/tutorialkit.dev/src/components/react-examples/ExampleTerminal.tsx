import type { Terminal as XTerm } from '@xterm/xterm';
import { Suspense, lazy, useEffect, useState } from 'react';
import { useTheme } from './hooks/useTheme';
import { useWebContainer } from './hooks/useWebcontainer';

const Terminal = lazy(() => import('@tutorialkit/react/core/Terminal'));

export default function ExampleTerminal() {
  // only needed in astro because of SSR
  const [domLoaded, setDomLoaded] = useState(false);

  const theme = useTheme();
  const { setTerminal } = useTerminal();

  useEffect(() => {
    setDomLoaded(true);
  }, []);

  return (
    domLoaded && (
      <Suspense>
        <Terminal className="h-32" readonly={false} theme={theme} onTerminalReady={setTerminal} />
      </Suspense>
    )
  );
}

function useTerminal() {
  const webcontainerPromise = useWebContainer();
  const [terminal, setTerminal] = useState<XTerm | null>(null);

  useEffect(() => {
    if (!terminal) {
      return;
    }

    run(terminal);

    async function run(terminal: XTerm) {
      const webcontainer = await webcontainerPromise;
      const process = await webcontainer.spawn('jsh', {
        terminal: {
          cols: terminal.cols,
          rows: terminal.rows,
        },
      });

      process.output.pipeTo(
        new WritableStream({
          write(data) {
            terminal.write(data);
          },
        }),
      );

      const shellWriter = process.input.getWriter();

      terminal.onData((data) => {
        shellWriter.write(data);
      });
    }
  }, [terminal]);

  return {
    setTerminal,
  };
}
