import { expect, test } from 'vitest';

import { EditorStore } from './editor.js';
import type { File } from '@tutorialkit/types';

test('initial files are sorted', () => {
  const store = new EditorStore();
  store.setDocuments({
    'test/math.test.ts': '',
    '.gitignore': '',
    'src/math.ts': '',
    'src/geometry.ts': '',
  });

  expect(store.files.get().map(toFilename)).toMatchInlineSnapshot(`
    [
      "src/geometry.ts",
      "src/math.ts",
      "test/math.test.ts",
      ".gitignore",
    ]
  `);
});

test('added files are sorted', () => {
  const store = new EditorStore();
  store.setDocuments({
    'test/math.test.ts': '',
    '.gitignore': '',
    'src/math.ts': '',
  });

  store.addFileOrFolder({ path: 'something.ts', type: 'FILE' });
  store.addFileOrFolder({ path: 'another.css', type: 'FILE' });
  store.addFileOrFolder({ path: 'no-extension', type: 'FILE' });

  expect(store.files.get().map(toFilename)).toMatchInlineSnapshot(`
    [
      "src/math.ts",
      "test/math.test.ts",
      ".gitignore",
      "another.css",
      "no-extension",
      "something.ts",
    ]
  `);
});

test('added folders are sorted', () => {
  const store = new EditorStore();
  store.setDocuments({
    'test/math.test.ts': '',
    '.gitignore': '',
    'src/math.ts': '',
  });

  store.addFileOrFolder({ path: 'src/components', type: 'FOLDER' });
  store.addFileOrFolder({ path: 'src/utils', type: 'FOLDER' });
  store.addFileOrFolder({ path: 'test/unit', type: 'FOLDER' });
  store.addFileOrFolder({ path: 'e2e', type: 'FOLDER' });

  expect(store.files.get().map(toFilename)).toMatchInlineSnapshot(`
    [
      "e2e",
      "src/components",
      "src/utils",
      "src/math.ts",
      "test/unit",
      "test/math.test.ts",
      ".gitignore",
    ]
  `);
});

test('empty directories are removed when new content is added', () => {
  const store = new EditorStore();
  store.setDocuments({
    'src/index.ts': '',
  });

  store.addFileOrFolder({ path: 'src/components', type: 'FOLDER' });

  expect(store.files.get().map(toFilename)).toMatchInlineSnapshot(`
    [
      "src/components",
      "src/index.ts",
    ]
  `);

  store.addFileOrFolder({ path: 'src/components/FileTree', type: 'FOLDER' });

  expect(store.files.get().map(toFilename)).toMatchInlineSnapshot(`
    [
      "src/components/FileTree",
      "src/index.ts",
    ]
  `);
});

function toFilename(file: File) {
  return file.path;
}