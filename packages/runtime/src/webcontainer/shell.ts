import type { WebContainer } from '@webcontainer/api';
import { withResolvers } from '../utils/promises.js';

export interface ITerminal {
  reset: () => void;
  onData: (cb: (data: string) => void) => void;
  write: (data: string) => void;
  cols: number;
  rows: number;
}

export async function newShellProcess(webcontainer: WebContainer, signal: AbortSignal, terminal: ITerminal) {
  const process = await webcontainer.spawn('/bin/jsh', ['--osc'], {
    terminal: {
      cols: terminal.cols,
      rows: terminal.rows,
    }
  });

  if (signal.aborted) {
    process.kill();
    signal.throwIfAborted();
  }

  const input = process.input.getWriter();
  const output = process.output;

  const jshReady = withResolvers<void>();
  let isInteractive = false;

  output.pipeTo(new WritableStream({
    write(data) {
      if (!isInteractive) {
        const [, osc] = data.match(/\x1b\]654;([^\x07]+)\x07/) || [];

        if (osc === 'interactive') {
          // wait until we see the interactive OSC
          isInteractive = true;

          jshReady.resolve();
        }
      }

      terminal.write(data);
    }
  }));

  terminal.onData((data) => {
    if (isInteractive) {
      input.write(data);
    }
  });

  const abortListener = () => process.kill();

  // if the task is aborted we kill the process
  signal.addEventListener('abort', abortListener, { once: true });

  await jshReady.promise;

  signal.removeEventListener('abort', abortListener);

  return process;
}
