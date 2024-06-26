import * as prompts from '@clack/prompts';
import { errorLabel } from './messages.js';

interface Task {
  title: string;
  task: (message: (string: string) => void) => string | Promise<string> | void | Promise<void>;
  dryRun?: boolean;
  dryRunMessage?: string;
  disabled?: boolean;
  hideError?: boolean;
}

export function assertNotCanceled<T>(value: T | symbol, exitCode = 0): asserts value is T {
  if (prompts.isCancel(value)) {
    prompts.cancel('Command aborted');

    console.log('Until next time!');

    process.exit(exitCode);
  }
}

export async function runTask(task: Task) {
  if (task.disabled === true) {
    return;
  }

  if (task.dryRun) {
    prompts.log.warn(task.dryRunMessage ?? `Skipped '${task.title}'`);
    return;
  }

  const spinner = prompts.spinner();
  spinner.start(task.title);

  try {
    const result = await task.task(spinner.message);
    spinner.stop(result || task.title);
  } catch (error) {
    spinner.stop(`${errorLabel()} ${error.message ?? 'Task failed'}`, 1);
  }
}
