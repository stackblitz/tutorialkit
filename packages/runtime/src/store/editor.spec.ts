import type { FileDescriptor } from '@tutorialkit/types';
import { expect, test } from 'vitest';

import { EditorStore } from './editor.js';

test('empty directories are removed when new content is added', () => {
  const store = new EditorStore();
  store.setDocuments({
    'src/index.ts': '',
  });

  store.addFileOrFolder({ path: 'src/components', type: 'folder' });

  expect(store.files.get().map(toFilename)).toMatchInlineSnapshot(`
    [
      "src/index.ts",
      "src/components",
    ]
  `);

  store.addFileOrFolder({ path: 'src/components/FileTree', type: 'folder' });

  expect(store.files.get().map(toFilename)).toMatchInlineSnapshot(`
    [
      "src/index.ts",
      "src/components/FileTree",
    ]
  `);
});

function toFilename(file: FileDescriptor) {
  return file.path;
}
