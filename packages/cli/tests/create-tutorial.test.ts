import path from 'node:path';
import fs from 'node:fs/promises';
import { expect, test } from 'vitest';
import { temporaryDirectory } from 'tempy';
import { execa } from 'execa';

const cwd = process.cwd();
const dir = temporaryDirectory();

test('test creating and building a template', async (options) => {
  const dest = path.join(dir, 'foobar');

  await execa('node', [path.join(cwd, 'dist/index.js'), 'create', 'foobar', '--defaults'], {
    cwd: dir,
    stdio: 'inherit',
    env: {
      TK_DIRECTORY: path.join(dest, 'packages'),
    },
  });

  console.log(await fs.readFile(path.join(dest, 'package.json'), 'utf8'));

  await execa('npm', ['run', 'build'], {
    cwd: dest,
  });

  console.log(await fs.readdir(dest));

  expect(false).toBe(true);
});
