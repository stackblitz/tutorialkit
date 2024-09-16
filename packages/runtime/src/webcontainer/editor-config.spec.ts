import { expect, test } from 'vitest';
import { EditorConfig } from './editor-config.js';

expect.addSnapshotSerializer({
  serialize: (val: EditorConfig) => JSON.stringify({ visible: val.visible, fileTree: val.fileTree }, null, 2),
  test: (val) => val instanceof EditorConfig,
});

test('sets default values', () => {
  const config = new EditorConfig();

  expect(config).toMatchInlineSnapshot(`
    {
      "visible": true,
      "fileTree": {
        "visible": true,
        "allowEdits": false
      }
    }
  `);
});

test('false hides editor', () => {
  const config = new EditorConfig(false);

  expect(config).toMatchInlineSnapshot(`
    {
      "visible": false,
      "fileTree": {
        "visible": false,
        "allowEdits": false
      }
    }
  `);
});

test('true enables editor, doesnt allow editing', () => {
  const config = new EditorConfig(true);

  expect(config).toMatchInlineSnapshot(`
    {
      "visible": true,
      "fileTree": {
        "visible": true,
        "allowEdits": false
      }
    }
  `);
});

test('"fileTree: false" hides fileTree', () => {
  const config = new EditorConfig({ fileTree: false });

  expect(config).toMatchInlineSnapshot(`
    {
      "visible": true,
      "fileTree": {
        "visible": false,
        "allowEdits": false
      }
    }
  `);
});

test('"fileTree: true" enables fileTree, disables editing', () => {
  const config = new EditorConfig({ fileTree: true });

  expect(config.fileTree).toMatchInlineSnapshot(`
    {
      "allowEdits": false,
      "visible": true,
    }
  `);
});

test('"fileTree.allowEdits: true" allows editing all entries', () => {
  const config = new EditorConfig({ fileTree: { allowEdits: true } });

  expect(config.fileTree).toMatchInlineSnapshot(`
    {
      "allowEdits": [
        "**",
      ],
      "visible": true,
    }
  `);
});

test('"fileTree.allowEdits: false" disables all editing', () => {
  const config = new EditorConfig({ fileTree: { allowEdits: false } });

  expect(config.fileTree).toMatchInlineSnapshot(`
    {
      "allowEdits": false,
      "visible": true,
    }
  `);
});

test('"fileTree.allowEdits" is converted to array', () => {
  const config = new EditorConfig({ fileTree: { allowEdits: '/src/**' } });

  expect(config.fileTree).toMatchInlineSnapshot(`
    {
      "allowEdits": [
        "/src/**",
      ],
      "visible": true,
    }
  `);
});

test('"fileTree.allowEdits: [...]" works', () => {
  const config = new EditorConfig({ fileTree: { allowEdits: ['/src/**', '**/*.test.ts'] } });

  expect(config.fileTree).toMatchInlineSnapshot(`
    {
      "allowEdits": [
        "/src/**",
        "**/*.test.ts",
      ],
      "visible": true,
    }
  `);
});
