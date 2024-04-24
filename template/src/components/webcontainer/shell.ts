import type { WebContainer } from '@webcontainer/api';
import { withResolvers } from './utils/promises';

export interface ITerminal {
  reset: () => void;
  write: (data: string) => void;
  cols: number;
  rows: number;
}

export async function newShellProcess(webcontainer: WebContainer, signal: AbortSignal, terminal: ITerminal) {
  const process = await webcontainer.spawn('jsh', { terminal });

  if (signal.aborted) {
    process.kill();
    signal.throwIfAborted();
  }

  const jshReady = withResolvers<void>();
  let isJSHReady = false;

  process.output.pipeTo(
    new WritableStream({
      write(data) {
        if (data.includes('❯') && !isJSHReady) {
          isJSHReady = true;

          jshReady.resolve();
        }

        terminal.write(data);
      },
    })
  );

  const abortListener = () => process.kill();

  // if the task is aborted we kill the process
  signal.addEventListener('abort', abortListener, { once: true });

  await jshReady.promise;

  signal.removeEventListener('abort', abortListener);

  return process;
}
