import { atom } from 'nanostores';
import type { Command } from './command.js';

export type Steps = Step[];

export interface Step {
  title: string;
  status: 'completed' | 'running' | 'failed' | 'skipped' | 'idle';
}

export class StepsController {
  /**
   * Steps that the runner is or will be executing.
   */
  steps = atom<Steps | undefined>(undefined);

  setFromCommands(commands: Command[]) {
    if (commands.length > 0) {
      this.steps.set(
        commands.map((command) => ({
          title: command.title,
          status: 'idle',
        })),
      );
    } else {
      this.steps.set(undefined);
    }
  }

  updateStep(index: number, step: Step) {
    const currentSteps = this.steps.value;

    if (!currentSteps) {
      return;
    }

    this.steps.set([...currentSteps.slice(0, index), step, ...currentSteps.slice(index + 1)]);
  }

  skipRemaining(index: number) {
    const currentSteps = this.steps.value;

    if (!currentSteps) {
      return;
    }

    this.steps.set([
      ...currentSteps.slice(0, index),
      ...currentSteps.slice(index).map((step) => ({
        ...step,
        status: 'skipped' as const,
      })),
    ]);
  }
}
