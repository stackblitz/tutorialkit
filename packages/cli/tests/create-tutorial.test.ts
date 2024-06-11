import path from 'node:path';
import fs from 'node:fs/promises';
import { afterAll, beforeAll, expect, test } from 'vitest';
import { execa } from 'execa';

const cwd = process.cwd();
const tmpDir = path.join(__dirname, '.tmp');

beforeAll(async () => {
  await fs.rm(tmpDir, { force: true, recursive: true });
  await fs.mkdir(tmpDir);
});

afterAll(async () => {
  await fs.rm(tmpDir, { force: true, recursive: true });
});

test('test creating a project', async () => {
  const name = 'test-1';
  const dest = path.join(tmpDir, name);

  await execa('node', [path.join(cwd, 'dist/index.js'), 'create', name, '--no-install', '--no-git', '--defaults'], {
    cwd: tmpDir,
    env: {
      TK_DIRECTORY: path.resolve(cwd, '..'),
    },
  });

  const projectFiles = await fs.readdir(dest, { recursive: true });

  expect(projectFiles.map(normaliseSlash).sort()).toMatchSnapshot();
});

test('test creating and building a project', async () => {
  const name = 'test-2';
  const dest = path.join(tmpDir, name);

  await execa('node', [path.join(cwd, 'dist/index.js'), 'create', name, '--no-git', '--defaults'], {
    cwd: tmpDir,
    env: {
      TK_DIRECTORY: path.resolve(cwd, '..'),
    },
  });

  await execa('npm', ['run', 'build'], {
    cwd: dest,
  });

  // remove `_astro` before taking the snapshot
  await fs.rm(path.join(dest, 'dist/_astro'), { force: true, recursive: true });

  const distFiles = await fs.readdir(path.join(dest, 'dist'), { recursive: true });

  expect(distFiles.map(normaliseSlash).sort()).toMatchSnapshot();
});

function normaliseSlash(filePath: string) {
  return filePath.replace(/\\/g, '/');
}
