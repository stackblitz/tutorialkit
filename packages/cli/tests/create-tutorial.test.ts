import { readFileSync } from 'node:fs';
import fs from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execa } from 'execa';
import { afterAll, beforeAll, expect, test } from 'vitest';
import { version } from '../package.json';

// on CI on windows we want to make sure to use the same drive, so we use a custom logic
const tmpDir =
  process.platform === 'win32'
    ? path.join(path.resolve(__dirname, '../../../..'), '.tmp')
    : await fs.mkdtemp(path.join(tmpdir(), 'tk-test-'));
const baseDir = path.resolve(__dirname, '../../..');

const cli = path.join(baseDir, 'packages/cli/dist/index.js');

beforeAll(async () => {
  await fs.rm(tmpDir, { force: true, recursive: true });
  await fs.mkdir(tmpDir);
});

afterAll(async () => {
  if (process.platform !== 'win32' || !process.env.CI) {
    await fs.rm(tmpDir, { force: true, recursive: true });
  }
});

test('cannot create project without installing but with starting', async (context) => {
  const name = context.task.id;

  await expect(
    execa('node', [cli, 'create', name, '--no-install', '--no-provider', '--start'], {
      cwd: tmpDir,
    }),
  ).rejects.toThrow('Cannot start project without installing dependencies.');
});

test('create a project', async (context) => {
  const name = context.task.id;
  const dest = path.join(tmpDir, name);

  await execa('node', [cli, 'create', name, '--no-install', '--no-git', '--no-provider', '--defaults'], {
    cwd: tmpDir,
  });

  const projectFiles = await fs.readdir(dest, { recursive: true });

  expect(projectFiles.map(normaliseSlash).sort()).toMatchSnapshot();
});

test('create a project with Netlify as provider', async (context) => {
  const name = context.task.id;
  const dest = path.join(tmpDir, name);

  await execa('node', [cli, 'create', name, '--no-install', '--no-git', '--defaults', '--provider', 'netlify'], {
    cwd: tmpDir,
  });

  const projectFiles = await fs.readdir(dest, { recursive: true });
  expect(projectFiles).toContain('netlify.toml');
});

test('create a project with Cloudflare as provider', async (context) => {
  const name = context.task.id;
  const dest = path.join(tmpDir, name);

  await execa('node', [cli, 'create', name, '--no-install', '--no-git', '--defaults', '--provider', 'cloudflare'], {
    cwd: tmpDir,
  });

  const projectFiles = await fs.readdir(dest, { recursive: true });
  expect(projectFiles).toContain('_headers');

  const packageJson = await fs.readFile(`${dest}/package.json`, 'utf8');
  const json = JSON.parse(packageJson);

  expect(json).toHaveProperty('scripts');
  expect(json.scripts).toHaveProperty('postbuild');
  expect(json.scripts.postbuild).toBe('cp _headers ./dist/');
});

test('create a project with Vercel as provider', async (context) => {
  const name = context.task.id;
  const dest = path.join(tmpDir, name);

  await execa('node', [cli, 'create', name, '--no-install', '--no-git', '--defaults', '--provider', 'vercel'], {
    cwd: tmpDir,
  });

  const projectFiles = await fs.readdir(dest, { recursive: true });
  expect(projectFiles).toContain('vercel.json');
});

test('create and build a project', async (context) => {
  const name = context.task.id;
  const dest = path.join(tmpDir, name);

  await execa('node', [cli, 'create', name, '--no-git', '--no-install', '--no-start', '--no-provider', '--defaults'], {
    cwd: tmpDir,
  });

  await runPnpmInstall(dest, baseDir);

  await execa('pnpm', ['run', 'build'], {
    cwd: dest,
  });

  // remove `_astro` before taking the snapshot
  await fs.rm(path.join(dest, 'dist/_astro'), { force: true, recursive: true });

  const distFiles = await fs.readdir(path.join(dest, 'dist'), { recursive: true });

  expect(distFiles.map(normaliseSlash).sort()).toMatchSnapshot();

  // create snapshot of lesson, solution and template file reference JSONs
  const lessonJsons = distFiles.filter((file) => file.endsWith('-files.json'));
  const solutionJsons = distFiles.filter((file) => file.endsWith('-solution.json'));
  const templateJsons = distFiles.filter((file) => file.startsWith('template-') && file.endsWith('.json'));

  const contents = [...lessonJsons, ...solutionJsons, ...templateJsons].reduce((jsons, current) => {
    const fileJson = JSON.parse(readFileSync(path.join(dest, 'dist', current), 'utf8'));
    const filenames = Object.keys(fileJson);

    return { ...jsons, [current]: filenames };
  }, {});

  expect(contents).toMatchSnapshot('built project file references');
});

test('create and eject a project', async (context) => {
  const name = context.task.id;
  const dest = path.join(tmpDir, name);

  await execa('node', [cli, 'create', name, '--no-git', '--no-install', '--no-start', '--no-provider', '--defaults'], {
    cwd: tmpDir,
  });

  await runPnpmInstall(dest, baseDir);

  await execa('node', [cli, 'eject', name, '--force', '--defaults'], {
    cwd: tmpDir,
  });

  if (process.platform !== 'win32') {
    await fs.rm(path.join(dest, 'node_modules'), { force: true, recursive: true, maxRetries: 5 });
  }

  let projectFiles = await fs.readdir(dest, { recursive: true });

  if (process.platform === 'win32') {
    projectFiles = projectFiles.filter((filePath) => !filePath.startsWith('node_modules'));
  }

  expect(projectFiles.map(normaliseSlash).sort()).toMatchSnapshot();
  expect(await fs.readFile(path.join(dest, 'astro.config.ts'), 'utf-8')).toMatchSnapshot();
});

test('create, eject and build a project', async (context) => {
  const name = context.task.id;
  const dest = path.join(tmpDir, name);

  await execa('node', [cli, 'create', name, '--no-git', '--no-install', '--no-start', '--no-provider', '--defaults'], {
    cwd: tmpDir,
  });

  await runPnpmInstall(dest, baseDir);

  await execa('node', [cli, 'eject', name, '--force', '--defaults'], {
    cwd: tmpDir,
  });

  await execa('pnpm', ['install', '--no-frozen-lockfile'], {
    cwd: dest,
  });

  await execa('pnpm', ['run', 'build'], {
    cwd: dest,
  });

  // remove `_astro` before taking the snapshot
  await fs.rm(path.join(dest, 'dist/_astro'), { force: true, recursive: true });

  const distFiles = await fs.readdir(path.join(dest, 'dist'), { recursive: true });

  expect(distFiles.map(normaliseSlash).sort()).toMatchSnapshot();
});

test('cannot eject on an empty folder', async (context) => {
  const name = context.task.id;
  const dest = path.join(tmpDir, name);

  await fs.mkdir(dest);

  await expect(
    execa('node', [cli, 'eject', name, '--force', '--defaults'], {
      cwd: tmpDir,
    }),
  ).rejects.toThrow('package.json does not exists!');
});

test('cannot eject on a node project that is not an Astro project', async (context) => {
  const name = context.task.id;
  const dest = path.join(tmpDir, name);

  await fs.mkdir(dest);

  await fs.writeFile(path.join(dest, 'package.json'), JSON.stringify({ name: 'not-tutorialkit' }));

  await expect(
    execa('node', [cli, 'eject', name, '--force', '--defaults'], {
      cwd: tmpDir,
    }),
  ).rejects.toThrow('astro.config.ts does not exists!');
});

test('cannot eject on an astro project that is not using TutorialKit', async (context) => {
  const name = context.task.id;
  const dest = path.join(tmpDir, name);

  await fs.mkdir(dest);
  await fs.mkdir(path.join(dest, 'src'));

  await fs.writeFile(
    path.join(dest, 'package.json'),
    JSON.stringify({ name: 'astro', dependencies: { astro: '4.11.0' } }),
  );

  await fs.writeFile(
    path.join(dest, 'astro.config.ts'),
    `
    import { defineConfig } from 'astro';

    export default defineConfig({});
  `,
  );

  await expect(
    execa('node', [cli, 'eject', name, '--force', '--defaults'], {
      cwd: tmpDir,
    }),
  ).rejects.toThrow(`@tutorialkit${path.sep}astro does not exists!`);
});

test('cannot eject on an astro project that is not using TutorialKit 2', async (context) => {
  const name = context.task.id;
  const dest = path.join(tmpDir, name);

  await fs.mkdir(dest);
  await fs.mkdir(path.join(dest, 'src'));

  await fs.writeFile(
    path.join(dest, 'package.json'),
    JSON.stringify({ name: 'astro', dependencies: { astro: '4.11.0', '@tutorialkit/astro': '*' } }),
  );

  await fs.writeFile(
    path.join(dest, 'astro.config.ts'),
    `
    import { defineConfig } from 'astro';

    export default defineConfig({});
  `,
  );

  await execa('pnpm', ['install'], {
    cwd: dest,
  });

  await expect(
    execa('node', [cli, 'eject', name, '--force', '--defaults'], {
      cwd: tmpDir,
    }),
  ).rejects.toThrow(`Could not find import to '@tutorialkit/astro'`);
});

test('--help prints out message', async () => {
  const { stdout } = await execa('node', [cli, '--help']);

  expect(stdout.replace(version, '[version]')).toMatchInlineSnapshot(`
    "
     @tutorialkit/cli  v[version] Create tutorial apps powered by WebContainer API

    Usage: @tutorialkit/cli [command] [...options]
           @tutorialkit/cli [ -h | --help | -v | --version ]

    Commands:
      create  Create new tutorial app
      eject   Move all default pages and components into your project, providing full control over the Astro app
      help    Show this help message"
  `);
});

function normaliseSlash(filePath: string) {
  return filePath.replace(/\\/g, '/');
}

async function runPnpmInstall(dest: string, baseDir: string) {
  const packageJsonPath = path.join(dest, 'package.json');
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

  packageJson.pnpm = {
    overrides: {
      '@astrojs/language-server': '2.14.1',
      '@tutorialkit/astro': `file:${baseDir}/packages/astro`,
      '@tutorialkit/react': `file:${baseDir}/packages/react`,
      '@tutorialkit/runtime': `file:${baseDir}/packages/runtime`,
      '@tutorialkit/theme': `file:${baseDir}/packages/theme`,
      '@tutorialkit/types': `file:${baseDir}/packages/types`,
    },
  };

  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, undefined, 2), 'utf8');

  await execa('pnpm', ['install'], {
    cwd: dest,
  });
}
