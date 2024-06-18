import 'test-utils';
import { WebContainer } from '@webcontainer/api';
import { describe, test, expect, beforeAll, vi, afterAll, beforeEach } from 'vitest';
import type { MockedWebContainer } from 'test-utils';
import { TutorialRunner } from '../src/tutorial-runner.js';
import { StepsController } from '../src/webcontainer/steps.js';
import { TerminalStore } from '../src/store/terminal.js';

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
});
