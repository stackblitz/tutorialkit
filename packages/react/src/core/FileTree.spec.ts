import type { FileDescriptor } from '@tutorialkit/types';
import { expect, test } from 'vitest';
import { sortFiles } from './FileTree.js';

expect.addSnapshotSerializer({
  serialize: (val) => `[${val.type}] ${val.path}`,
  test: (val) => val?.type === 'file' || val?.type === 'folder',
});

test('initial files are sorted', () => {
  const files: FileDescriptor[] = [
    { path: 'test/math.test.ts', type: 'file' },
    { path: '.gitignore', type: 'file' },
    { path: 'src/math.ts', type: 'file' },
    { path: 'src/geometry.ts', type: 'file' },
  ];

  files.sort(sortFiles);

  expect(files).toMatchInlineSnapshot(`
    [
      [file] src/geometry.ts,
      [file] src/math.ts,
      [file] test/math.test.ts,
      [file] .gitignore,
    ]
  `);
});

test('added files are sorted', () => {
  const files: FileDescriptor[] = [
    { path: 'test/math.test.ts', type: 'file' },
    { path: '.gitignore', type: 'file' },
    { path: 'src/math.ts', type: 'file' },

    // added files at the end of the list
    { path: 'something.ts', type: 'file' },
    { path: 'another.css', type: 'file' },
    { path: 'no-extension', type: 'file' },
  ];

  files.sort(sortFiles);

  expect(files).toMatchInlineSnapshot(`
    [
      [file] src/math.ts,
      [file] test/math.test.ts,
      [file] .gitignore,
      [file] another.css,
      [file] no-extension,
      [file] something.ts,
    ]
  `);
});

test('added folders are sorted', () => {
  const files: FileDescriptor[] = [
    { path: 'test/math.test.ts', type: 'file' },
    { path: '.gitignore', type: 'file' },
    { path: 'src/math.ts', type: 'file' },

    // added files at the end of the list
    { path: 'src/components', type: 'folder' },
    { path: 'src/utils', type: 'folder' },
    { path: 'test/unit', type: 'folder' },
    { path: 'e2e', type: 'folder' },
  ];

  files.sort(sortFiles);

  expect(files).toMatchInlineSnapshot(`
    [
      [folder] e2e,
      [folder] src/components,
      [folder] src/utils,
      [file] src/math.ts,
      [folder] test/unit,
      [file] test/math.test.ts,
      [file] .gitignore,
    ]
  `);
});
