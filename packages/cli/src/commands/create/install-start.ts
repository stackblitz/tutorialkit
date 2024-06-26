import * as prompts from '@clack/prompts';
import { assertNotCanceled } from '../../utils/tasks.js';
import { DEFAULT_VALUES, readFlag, type CreateOptions } from './options.js';

export async function installAndStart(flags: CreateOptions) {
  const installDeps = readFlag(flags, 'install');
  const startProject = readFlag(flags, 'start');

  if (installDeps === false) {
    // the user doesn't want to install the dependencies, which means we can't start the project either
    return { install: false, start: false };
  }

  if (startProject) {
    // the user wants to start the project, so we also have to install the dependencies
    return { install: true, start: true };
  }

  if (installDeps) {
    if (startProject === false) {
      // the user wants to install the dependencies but expicitly not start the project
      return { install: true, start: false };
    } else {
      // the user explicitly wants to install the dependencies, but we don't know if they want to start the project
      const answer = await prompts.confirm({
        message: 'Start project?',
        initialValue: DEFAULT_VALUES.install,
      });

      assertNotCanceled(answer);

      return { install: true, start: answer };
    }
  }

  const answer = await prompts.confirm({
    message: 'Install dependencies and start project?',
    initialValue: DEFAULT_VALUES.install,
  });

  assertNotCanceled(answer);

  return { install: answer, start: answer };
}
