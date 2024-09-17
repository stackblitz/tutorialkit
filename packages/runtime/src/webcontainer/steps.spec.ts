import { describe, test, expect } from 'vitest';
import { Command } from './command.js';
import { StepsController } from './steps.js';

describe('StepsController', () => {
  test('setFromCommands should set steps from commands', () => {
    const controller = new StepsController();

    controller.setFromCommands([new Command('npm install'), new Command('npm run start')]);

    const steps = controller.steps.get()!;

    expect(steps.length).toBe(2);
    expect(steps[0].status).toBe('idle');
    expect(steps[1].status).toBe('idle');
    expect(steps[0].title).toBe('npm install');
    expect(steps[1].title).toBe('npm run start');
  });

  test('updateStep should update a step', () => {
    const controller = new StepsController();

    controller.setFromCommands([new Command('npm install'), new Command('npm run start')]);
    controller.updateStep(0, { title: 'npm install', status: 'running' });

    const steps = controller.steps.get()!;

    expect(steps[0].status).toBe('running');
    expect(steps[1].status).toBe('idle');
  });

  test('skipRemaining should skip remaining steps', () => {
    const controller = new StepsController();

    controller.setFromCommands([new Command('npm install'), new Command('npm run start')]);
    controller.skipRemaining(0);

    const steps = controller.steps.get()!;

    expect(steps[0].status).toBe('skipped');
    expect(steps[1].status).toBe('skipped');
  });
});
