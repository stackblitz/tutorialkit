import { resetProcessFactory, setProcessFactory } from 'test-utils';
import { WebContainer } from '@webcontainer/api';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import type { MockedWebContainer } from 'test-utils';
import { TutorialRunner } from './tutorial-runner.js';
import { StepsController } from './webcontainer/steps.js';
import { TerminalStore } from './store/terminal.js';
import { withResolvers } from './utils/promises.js';

beforeEach(() => {
  resetProcessFactory();
});

describe('TutorialRunner', () => {
  test('prepareFiles should mount files to WebContainer', async () => {
    const webcontainer = WebContainer.boot();
    const mock = (await webcontainer) as MockedWebContainer;
    const runner = new TutorialRunner(webcontainer, new TerminalStore(webcontainer, false), new StepsController());

    await runner.prepareFiles({
      files: {
        '/src/index.js': 'console.log("Hello, world!")',
        '/src/index.html': '<h1>Hello, world!</h1>',
      },
      template: {
        '/package.json': '{ "name": "my-project" }',
      },
    });

    expect(mock._fakeFs).toMatchInlineSnapshot(`
      {
        "package.json": {
          "file": {
            "contents": "{ "name": "my-project" }",
          },
        },
        "src": {
          "directory": {
            "index.html": {
              "file": {
                "contents": "<h1>Hello, world!</h1>",
              },
            },
            "index.js": {
              "file": {
                "contents": "console.log("Hello, world!")",
              },
            },
          },
        },
      }
    `);
  });

  test('runCommands should execute commands only after load has completed', async () => {
    const webcontainer = WebContainer.boot();
    const mock = (await webcontainer) as MockedWebContainer;

    const { promise: runCommandPromise, resolve } = withResolvers();

    const processFactory = vi.fn(() => {
      resolve(JSON.stringify(mock._fakeFs, undefined, 2));

      return [
        new Promise<number>(() => {}),
        new ReadableStream<string>({
          start(controller) {
            controller.close();
          },
        }),
        new WritableStream<string>({
          write() {},
        }),
      ] as const;
    });

    setProcessFactory(processFactory);

    const runner = new TutorialRunner(webcontainer, new TerminalStore(webcontainer, false), new StepsController());

    runner.setCommands({
      mainCommand: 'some command',
    });

    runner.prepareFiles({
      files: {
        '/src/index.js': 'console.log("Hello, world!")',
        '/src/index.html': '<h1>Hello, world!</h1>',
      },
      template: {
        '/package.json': '{ "name": "my-project" }',
      },
    });

    runner.runCommands();

    const fs = await runCommandPromise;

    expect(processFactory).toHaveBeenCalledTimes(1);
    expect(fs).toMatchInlineSnapshot(`
      "{
        "package.json": {
          "file": {
            "contents": "{ \\"name\\": \\"my-project\\" }"
          }
        },
        "src": {
          "directory": {
            "index.js": {
              "file": {
                "contents": "console.log(\\"Hello, world!\\")"
              }
            },
            "index.html": {
              "file": {
                "contents": "<h1>Hello, world!</h1>"
              }
            }
          }
        }
      }"
    `);

    expect(mock._fakeProcesses).toMatchInlineSnapshot(`
      [
        {
          "args": [
            "command",
          ],
          "command": "some",
          "options": {
            "terminal": undefined,
          },
        },
      ]
    `);
  });
});
