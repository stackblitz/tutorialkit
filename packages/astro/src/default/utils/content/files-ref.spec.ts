import { expect, test } from 'vitest';

import { getFilesRefList } from './files-ref';

test('getFilesRefList returns files', async () => {
  const files = await getFilesRefList('test/fixtures/files', '');

  expect(files).toMatchInlineSnapshot(`
    [
      "test-fixtures-files.json",
      [
        "/first.js",
        "/nested/directory/second.ts",
      ],
    ]
  `);
});
