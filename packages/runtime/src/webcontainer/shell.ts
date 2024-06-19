import type { WebContainer } from '@webcontainer/api';
import { withResolvers } from '../utils/promises.js';
import type { ITerminal } from '../utils/terminal.js';

interface ProcessOptions {
  /**
   * Set to `true` if you want to allow redirecting output (e.g. `echo foo > bar`).
   */
  allowRedirects: boolean;

  /**
   * List of commands that are allowed by the JSH process.
   */
  allowCommands?: string[];
}

export async function newJSHProcess(
  webcontainer: WebContainer,
  terminal: ITerminal,
  options: ProcessOptions | undefined,
) {
  const args: string[] = [];

  if (!options?.allowRedirects) {
    // if redirects are turned off, start JSH with `--no-redirects`
    args.push('--no-redirects');
  }

  if (Array.isArray(options?.allowCommands)) {
    // if only a subset of commands is allowed, pass it down to JSH
    args.push('--allow-commands', options.allowCommands.join(','));
  }

  // we spawn a JSH process with a fallback cols and rows in case the process is not attached yet to a visible terminal
  const process = await webcontainer.spawn('/bin/jsh', ['--osc', ...args], {
    terminal: {
      cols: terminal.cols ?? 80,
      rows: terminal.rows ?? 15,
    },
  });

  const input = process.input.getWriter();
  const output = process.output;

  const jshReady = withResolvers<void>();
  let isInteractive = false;

  output.pipeTo(
    new WritableStream({
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
      },
    }),
  );

  terminal.onData((data) => {
    if (isInteractive) {
      input.write(data);
    }
  });

  await jshReady.promise;

  return process;
}
