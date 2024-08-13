import path from 'node:path';
import fs from 'node:fs/promises';
import { describe, beforeEach, afterAll, expect, it } from 'vitest';
import { execa } from 'execa';
import { temporaryDirectory } from 'tempy';

const baseDir = path.resolve(__dirname, '../../..');

const cli = path.join(baseDir, 'packages/cli/dist/index.js');

interface TestContext {
  projectName: string;
  dest: string;
}

const tmp = temporaryDirectory();

beforeEach<TestContext>(async (context) => {
  context.projectName = Math.random().toString(36).substring(7);
  context.dest = path.join(tmp, context.projectName);
});

afterAll(async () => {
  await fs.rm(tmp, { force: true, recursive: true });
});

describe.each(['npm', 'pnpm', 'yarn'])('%s', (packageManager) => {
  const snapshotPrefix = `./__snapshots__/${packageManager}`;

  it<TestContext>('should create a project', async ({ projectName, dest }) => {
    await createProject(projectName, packageManager, { cwd: tmp });

    const projectFiles = await fs.readdir(dest, { recursive: true });

    expect(filesToJSON(projectFiles)).toMatchFileSnapshot(`${snapshotPrefix}-created.json`);
  });

  it<TestContext>('should create and build a project', async ({ projectName, dest }) => {
    await createProject(projectName, packageManager, { cwd: tmp, install: true });

    await execa(packageManager, ['run', 'build'], {
      cwd: dest,
    });

    // remove `_astro` before taking the snapshot
    await fs.rm(path.join(dest, 'dist/_astro'), { force: true, recursive: true });

    const distFiles = await fs.readdir(path.join(dest, 'dist'), { recursive: true });

    expect(filesToJSON(distFiles)).toMatchFileSnapshot(`${snapshotPrefix}-built.json`);
  });
});

async function createProject(name: string, packageManager: string, options: { cwd: string; install?: boolean }) {
  const args = [
    cli,
    'create',
    name,
    `--${options.install ? '' : 'no-'}install`,
    '--no-git',
    '--no-start',
    '--package-manager',
    packageManager,
    '--defaults',
  ];

  console.log(`> node ${args.join(' ')}`);

  await execa('node', args, { cwd: options.cwd });
}

function filesToJSON(files: string[]) {
  return JSON.stringify(files.map((file) => file.replaceAll(path.sep, '/')).sort(), null, 2);
}
