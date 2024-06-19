import path from 'node:path';
import fs from 'node:fs/promises';
import { afterAll, beforeAll, expect, test } from 'vitest';
import { execa } from 'execa';

const tmpDir = path.join(__dirname, '.tmp');
const baseDir = path.resolve(__dirname, '../../..');

const cli = path.join(baseDir, 'packages/cli/dist/index.js');

beforeAll(async () => {
  await fs.rm(tmpDir, { force: true, recursive: true });
  await fs.mkdir(tmpDir);
});

afterAll(async () => {
  await fs.rm(tmpDir, { force: true, recursive: true });
});

test('cannot create project without installing but with starting', async (context) => {
  const name = context.task.id;

  await expect(
    execa('node', [cli, 'create', name, '--no-install', '--start'], {
      cwd: tmpDir,
      env: {
        TK_DIRECTORY: baseDir,
      },
    }),
  ).rejects.toThrow('Cannot start project without installing dependencies.');
});

test('create a project', async (context) => {
  const name = context.task.id;
  const dest = path.join(tmpDir, name);

  await execa('node', [cli, 'create', name, '--no-install', '--no-git', '--defaults'], {
    cwd: tmpDir,
    env: {
      TK_DIRECTORY: baseDir,
    },
  });

  const projectFiles = await fs.readdir(dest, { recursive: true });

  expect(projectFiles.map(normaliseSlash).sort()).toMatchSnapshot();
});

test('create and build a project', async (context) => {
  const name = context.task.id;
  const dest = path.join(tmpDir, name);

  await execa('node', [cli, 'create', name, '--no-git', '--no-start', '--defaults'], {
    cwd: tmpDir,
    env: {
      TK_DIRECTORY: baseDir,
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
