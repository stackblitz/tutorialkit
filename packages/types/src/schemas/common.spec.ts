import { describe, it, expect } from 'vitest';
import {
  commandSchema,
  commandsSchema,
  previewSchema,
  terminalSchema,
  webcontainerSchema,
  baseSchema,
} from './common.js';

describe('commandSchema', () => {
  it('should allow a single string command', () => {
    expect(() => {
      commandSchema.parse('npm run build');
    }).not.toThrow();
  });

  it('should allow a tuple of command and title', () => {
    expect(() => {
      commandSchema.parse(['npm run build', 'Build']);
    }).not.toThrow();
  });

  it('should allow an object with command and title properties', () => {
    expect(() => {
      commandSchema.parse({ command: 'npm run build', title: 'Build' });
    }).not.toThrow();
  });

  it('should throw an error if command is not a string', () => {
    expect(() => {
      commandSchema.parse(123);
    }).toThrow();
  });

  it('should throw an error if tuple does not have two elements', () => {
    expect(() => {
      commandSchema.parse(['npm run build']);
    }).toThrow();
  });

  it('should throw an error if object is missing command property', () => {
    expect(() => {
      commandSchema.parse({ title: 'Build' });
    }).toThrow();
  });

  it('should throw an error if object is missing title property', () => {
    expect(() => {
      commandSchema.parse({ command: 'npm run build' });
    }).toThrow();
  });
});

describe('commandsSchema', () => {
  it('should allow an empty object', () => {
    expect(() => {
      commandsSchema.parse({});
    }).not.toThrow();
  });

  it('should allow specifying the mainCommand', () => {
    expect(() => {
      commandsSchema.parse({
        mainCommand: 'npm run start',
      });
    }).not.toThrow();
  });

  it('should allow specifying an array of prepareCommands', () => {
    expect(() => {
      commandsSchema.parse({
        prepareCommands: ['npm install', 'npm run build'],
      });
    }).not.toThrow();
  });

  it('should allow specifying an array of prepareCommands as string, tuple, and object', () => {
    expect(() => {
      commandsSchema.parse({
        prepareCommands: ['npm install', ['npm run build', 'Build'], { command: 'npm run test', title: 'Test' }],
      });
    }).not.toThrow();
  });

  it('should throw an error if mainCommand is not a string', () => {
    expect(() => {
      commandsSchema.parse({
        mainCommand: 123,
      });
    }).toThrow();
  });

  it('should throw an error if prepareCommands is not an array', () => {
    expect(() => {
      commandsSchema.parse({
        prepareCommands: 'npm install',
      });
    }).toThrow();
  });

  it('should throw an error if prepareCommands array contains non-string values', () => {
    expect(() => {
      commandsSchema.parse({
        prepareCommands: ['npm install', 123],
      });
    }).toThrow();
  });
});

describe('previewSchema', () => {
  it('should allow disabling the preview entirely', () => {
    expect(() => {
      previewSchema.parse(false);
    }).not.toThrow();
  });

  it('should allow specifying a number as the port', () => {
    expect(() => {
      previewSchema.parse([3000]);
    }).not.toThrow();
  });

  it('should allow specifying a tuple of port and title', () => {
    expect(() => {
      previewSchema.parse([[3000, 'Preview']]);
    }).not.toThrow();
  });

  it('should allow specifying an array of port and title tuples', () => {
    expect(() => {
      previewSchema.parse([
        [3000, 'Preview 1'],
        [4000, 'Preview 2'],
      ]);
    }).not.toThrow();
  });

  it('should allow specifying an array of port and title tuples as objects', () => {
    expect(() => {
      previewSchema.parse([
        { port: 3000, title: 'Preview 1' },
        { port: 4000, title: 'Preview 2' },
      ]);
    }).not.toThrow();
  });

  it('should allow specifying a combination of tuples', () => {
    expect(() => {
      previewSchema.parse([2000, [3000, 'Preview 1'], { port: 4000, title: 'Preview 2' }]);
    }).not.toThrow();
  });

  it('should throw an error if tuple does not have two elements', () => {
    expect(() => {
      previewSchema.parse([[3000]]);
    }).toThrow();
  });

  it('should throw an error if object is missing port property', () => {
    expect(() => {
      previewSchema.parse({ title: 'Preview' });
    }).toThrow();
  });

  it('should throw an error if object is missing title property', () => {
    expect(() => {
      previewSchema.parse({ port: 3000 });
    }).toThrow();
  });
});

describe('terminalSchema', () => {
  it('should allow disabling the terminal entirely', () => {
    expect(() => {
      terminalSchema.parse(false);
    }).not.toThrow();
  });

  it('should allow specifying a single output panel', () => {
    expect(() => {
      terminalSchema.parse({
        panels: 'output',
        activePanel: 0,
      });
    }).not.toThrow();
  });

  it('should allow specifying a single terminal panel', () => {
    expect(() => {
      terminalSchema.parse({
        panels: 'terminal',
        activePanel: 0,
      });
    }).not.toThrow();
  });

  it('should allow specifying an array of output and terminal panels', () => {
    expect(() => {
      terminalSchema.parse({
        panels: ['output', 'terminal'],
        activePanel: 1,
      });
    }).not.toThrow();
  });

  it('should allow specifying an array of output and terminal panels with names', () => {
    expect(() => {
      terminalSchema.parse({
        panels: [
          ['output', 'Output Panel'],
          ['terminal', 'Terminal Panel'],
        ],
        activePanel: 0,
      });
    }).not.toThrow();
  });

  it('should allow specifying an array of output and terminal panels with names and ids', () => {
    expect(() => {
      terminalSchema.parse({
        panels: [
          { type: 'output', title: 'Output Panel', id: 'output-panel' },
          { type: 'terminal', title: 'Terminal Panel', id: 'terminal-panel' },
        ],
        activePanel: 1,
      });
    }).not.toThrow();
  });

  it('should allow specifying an a combination of panel syntaxes', () => {
    expect(() => {
      terminalSchema.parse({
        panels: ['output', ['terminal', 'TERMINAL'], { type: 'terminal', title: 'Terminal Panel' }],
        activePanel: 1,
      });
    }).not.toThrow();
  });

  it('should throw an error if tuple does not have two elements', () => {
    expect(() => {
      terminalSchema.parse({
        panels: [['output']],
        activePanel: 1,
      });
    }).toThrow();
  });

  it('should throw an error if panel object does not have a type', () => {
    expect(() => {
      terminalSchema.parse({
        panels: [{ title: 'Terminal' }],
        activePanel: 1,
      });
    }).toThrow();
  });

  it('should throw an error if multiple output panels are defined', () => {
    expect(() => {
      terminalSchema.parse({
        panels: ['output', 'output'],
        activePanel: 0,
      });
    }).toThrow('Only a single output panel can be defined.');

    expect(() => {
      terminalSchema.parse({
        panels: ['output', ['output', 'Output Panel']],
        activePanel: 0,
      });
    }).toThrow('Only a single output panel can be defined.');

    expect(() => {
      terminalSchema.parse({
        panels: ['output', { type: 'output' }],
        activePanel: 0,
      });
    }).toThrow('Only a single output panel can be defined.');
  });
});

describe('webcontainerSchema', () => {
  it('should allow an empty object', () => {
    expect(() => {
      webcontainerSchema.parse({});
    }).not.toThrow();
  });

  it('should allow specifying the mainCommand', () => {
    expect(() => {
      webcontainerSchema.parse({
        mainCommand: 'npm run start',
      });
    }).not.toThrow();
  });

  it('should allow specifying an array of prepareCommands', () => {
    expect(() => {
      webcontainerSchema.parse({
        prepareCommands: ['npm install', 'npm run build'],
      });
    }).not.toThrow();
  });

  it('should allow specifying an array of prepareCommands as string, tuple, and object', () => {
    expect(() => {
      webcontainerSchema.parse({
        prepareCommands: ['npm install', ['npm run build', 'Build'], { command: 'npm run test', title: 'Test' }],
      });
    }).not.toThrow();
  });

  it('should throw an error if mainCommand is not a string', () => {
    expect(() => {
      webcontainerSchema.parse({
        mainCommand: 123,
      });
    }).toThrow();
  });

  it('should throw an error if prepareCommands is not an array', () => {
    expect(() => {
      webcontainerSchema.parse({
        prepareCommands: 'npm install',
      });
    }).toThrow();
  });

  it('should throw an error if prepareCommands array contains non-string values', () => {
    expect(() => {
      webcontainerSchema.parse({
        prepareCommands: ['npm install', 123],
      });
    }).toThrow();
  });

  it('should allow specifying the previews', () => {
    expect(() => {
      webcontainerSchema.parse({
        previews: false,
      });
    }).not.toThrow();
  });

  it('should allow specifying the autoReload', () => {
    expect(() => {
      webcontainerSchema.parse({
        autoReload: true,
      });
    }).not.toThrow();
  });

  it('should allow specifying the template', () => {
    expect(() => {
      webcontainerSchema.parse({
        template: 'default',
      });
    }).not.toThrow();
  });
  it('should allow specifying the terminal', () => {
    expect(() => {
      webcontainerSchema.parse({
        terminal: false,
      });
    }).not.toThrow();
  });

  it('should allow specifying the focus', () => {
    expect(() => {
      webcontainerSchema.parse({
        focus: 'index.js',
      });
    }).not.toThrow();
  });

  it('should allow specifying the editor', () => {
    expect(() => {
      webcontainerSchema.parse({
        editor: false,
      });
    }).not.toThrow();
  });

  it('should allow specifying the editor with fileTree', () => {
    expect(() => {
      webcontainerSchema.parse({
        editor: {
          fileTree: true,
        },
      });
    }).not.toThrow();
  });

  it('should throw an error if editor is not a boolean or object', () => {
    expect(() => {
      webcontainerSchema.parse({
        editor: 'true',
      });
    }).toThrow();
  });
});

describe('baseSchema', () => {
  it('should allow specifying the title', () => {
    expect(() => {
      baseSchema.parse({
        title: 'My App',
      });
    }).not.toThrow();
  });

  it('should allow specifying the slug as optional', () => {
    expect(() => {
      baseSchema.parse({
        title: 'My App',
        slug: 'my-app',
      });
    }).not.toThrow();
  });

  it('should throw an error if title is missing', () => {
    expect(() => {
      baseSchema.parse({
        slug: 'my-app',
      });
    }).toThrow();
  });

  it('should allow specifying the previews', () => {
    expect(() => {
      baseSchema.parse({
        title: 'My App',
        previews: false,
      });
    }).not.toThrow();
  });

  it('should allow specifying the autoReload', () => {
    expect(() => {
      baseSchema.parse({
        title: 'My App',
        autoReload: true,
      });
    }).not.toThrow();
  });

  it('should allow specifying the template', () => {
    expect(() => {
      baseSchema.parse({
        title: 'My App',
        template: 'default',
      });
    }).not.toThrow();
  });

  it('should allow specifying the terminal', () => {
    expect(() => {
      baseSchema.parse({
        title: 'My App',
        terminal: false,
      });
    }).not.toThrow();
  });

  it('should allow specifying the focus', () => {
    expect(() => {
      baseSchema.parse({
        title: 'My App',
        focus: 'index.js',
      });
    }).not.toThrow();
  });

  it('should allow specifying the editor', () => {
    expect(() => {
      baseSchema.parse({
        title: 'My App',
        editor: false,
      });
    }).not.toThrow();
  });

  it('should allow specifying the editor with fileTree', () => {
    expect(() => {
      baseSchema.parse({
        title: 'My App',
        editor: {
          fileTree: true,
        },
      });
    }).not.toThrow();
  });

  it('should throw an error if editor is not a boolean or object', () => {
    expect(() => {
      baseSchema.parse({
        title: 'My App',
        editor: 'true',
      });
    }).toThrow();
  });
});
