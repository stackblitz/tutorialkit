import { spawn, type ChildProcess, type StdioOptions } from 'node:child_process';

export interface ShellCommandOptions {
  cwd?: string | URL;
  stdio?: StdioOptions;
  timeout?: number;
}

export interface Output {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export async function runShellCommand(
  command: string,
  flags: string[],
  opts: ShellCommandOptions = {},
): Promise<Output> {
  let child: ChildProcess;
  let stdout = '';
  let stderr = '';

  try {
    child = spawn(command, flags, {
      cwd: opts.cwd,
      shell: true,
      stdio: opts.stdio,
      timeout: opts.timeout,
    });

    const done = new Promise((resolve, reject) => {
      child.on('close', (code) => {
        if (code !== 0) {
          reject(code);

          return;
        }

        resolve(code);
      });

      child.on('error', (code) => {
        reject(code);
      });
    });

    child.stdout?.setEncoding('utf8');
    child.stderr?.setEncoding('utf8');

    child.stdout?.on('data', (data) => {
      stdout += data;
    });

    child.stderr?.on('data', (data) => {
      stderr += data;
    });

    await done;
  } catch (error) {
    throw { stdout, stderr, exitCode: error };
  }

  return { stdout, stderr, exitCode: child.exitCode };
}
