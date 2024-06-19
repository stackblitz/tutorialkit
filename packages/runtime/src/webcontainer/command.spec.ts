import { describe, expect, it } from 'vitest';
import { Commands, Command } from './command.js';

describe('Commands', () => {
  it('should accept shell like commands', () => {
    const commands = new Commands({
      mainCommand: 'npm run start',
      prepareCommands: ['npm install'],
    });

    expect(commands.mainCommand?.shellCommand).toBe('npm run start');
    expect(commands.prepareCommands?.[0].shellCommand).toBe('npm install');
  });

  it('should accept a tuple of [shell, title]', () => {
    const commands = new Commands({
      mainCommand: ['npm run start', 'Start dev server'],
      prepareCommands: [['npm install', 'Installing dependencies']],
    });

    expect(commands.mainCommand?.shellCommand).toBe('npm run start');
    expect(commands.mainCommand?.title).toBe('Start dev server');
    expect(commands.prepareCommands?.[0].shellCommand).toBe('npm install');
    expect(commands.prepareCommands?.[0].title).toBe('Installing dependencies');
  });

  it('should accept objects with { title, command }', () => {
    const commands = new Commands({
      mainCommand: { command: 'npm run start', title: 'Start dev server' },
      prepareCommands: [{ command: 'npm install', title: 'Installing dependencies' }],
    });

    expect(commands.mainCommand?.shellCommand).toBe('npm run start');
    expect(commands.mainCommand?.title).toBe('Start dev server');
    expect(commands.prepareCommands?.[0].shellCommand).toBe('npm install');
    expect(commands.prepareCommands?.[0].title).toBe('Installing dependencies');
  });

  it('should be iterable', () => {
    const commands = new Commands({
      mainCommand: 'npm run start',
      prepareCommands: ['npm install', 'npm run build'],
    });

    const iterator: Iterator<Command> = commands[Symbol.iterator]();
    expect(iterator.next().value.shellCommand).toBe('npm install');
    expect(iterator.next().value.shellCommand).toBe('npm run build');
    expect(iterator.next().value.shellCommand).toBe('npm run start');
    expect(iterator.next().done).toBe(true);
  });
});

describe('Command', () => {
  it('should be runnable if shell command is not empty', () => {
    const command = new Command('npm install');
    expect(command.isRunnable()).toBe(true);
  });

  it('should not be runnable if shell command is empty', () => {
    const command = new Command('');
    expect(command.isRunnable()).toBe(false);
  });

  it('should compare commands by shell command', () => {
    const a = new Command('npm install');
    const b = new Command('npm install');
    const c = new Command('npm run start');

    expect(Command.equals(a, b)).toBe(true);
    expect(Command.equals(a, c)).toBe(false);
  });

  it('should extract title from command', () => {
    const command = new Command({ command: 'npm install', title: 'Installing dependencies' });
    expect(command.title).toBe('Installing dependencies');
  });

  it('should convert command to shell command', () => {
    const command = new Command({ command: 'npm install', title: 'Installing dependencies' });
    expect(command.shellCommand).toBe('npm install');
  });
});
