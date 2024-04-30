import type { CommandSchema, CommandsSchema } from '@schemas';

export class Commands implements Iterable<Command> {
  /**
   * Main command to run. Typically a dev server, e.g. `npm run start`.
   */
  readonly prepareCommands?: Command[];

  /**
   * List of commands executed before the main command.
   */
  readonly mainCommand?: Command;

  constructor({ prepareCommands, mainCommand }: CommandsSchema) {
    this.prepareCommands = prepareCommands?.map((c) => new Command(c));
    this.mainCommand = mainCommand ? new Command(mainCommand) : undefined;
  }

  [Symbol.iterator]() {
    const _this = this;

    return (function* () {
      for (const command of _this.prepareCommands ?? []) {
        yield command;
      }

      if (_this.mainCommand) {
        yield _this.mainCommand;
      }
    })();
  }
}

export class Command {
  /**
   * The command as it would be entered if executed in a shell.
   */
  readonly shellCommand: string;

  /**
   * Title describing what this command does, e.g. "Installing dependencies"
   */
  readonly title: string;

  constructor(command: CommandSchema) {
    this.shellCommand = Command.toShellCommand(command);
    this.title = Command.toTitle(command);
  }

  isRunnable() {
    return this.shellCommand !== '';
  }

  static areEquals(a: Command, b: Command) {
    return a.shellCommand === b.shellCommand;
  }

  static toTitle(command: CommandSchema) {
    let title = '';

    if (typeof command === 'string') {
      title = command;
    } else if (Array.isArray(command)) {
      title = command[1];
    } else {
      title = command.title;
    }

    return title;
  }

  static toShellCommand(command: CommandSchema) {
    if (typeof command === 'string') {
      return command;
    }

    if (Array.isArray(command)) {
      return command[0];
    }

    return command.command;
  }
}
