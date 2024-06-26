import fs from 'node:fs/promises';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { FilesMapCache } from './cache.js';
import { FilesMap } from './filesmap.js';
import { getAllFilesMap } from './utils.js';

const tmpDir = path.join(__dirname, `.tmp-${path.basename(__filename)}`);
const dirs = {
  contentDir: path.normalize(path.join(tmpDir, 'src/content/tutorial')),
  templatesDir: path.normalize(path.join(tmpDir, 'src/templates')),
};

beforeEach(async () => {
  await fs.rm(tmpDir, { force: true, recursive: true });
  await fs.mkdir(tmpDir);
});

afterEach(async () => {
  await fs.rm(tmpDir, { force: true, recursive: true });
});

describe('FilesMapCache', () => {
  test('it works', async () => {
    await scaffoldTestFolders([
      ['src/content/tutorial/lesson/_files', { file1: '' }],
      ['src/templates/tmp1', { file1: '' }],
      ['src/templates/tmp2', { file2: '' }],
    ]);

    const folders = await getAllFilesMap(dirs);
    const logger = {
      warn: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
    };
    const server = {
      hot: {
        send: vi.fn(),
      },
    };

    const graph = await FilesMap.initGraph(folders, logger as any);
    const cache = new FilesMapCache(graph, logger as any, server as any, dirs);

    cache.generateFileMapForPath(path.join(tmpDir, 'src/content/tutorial/lesson/_files'));

    const res = await cache.canHandle('/lesson-files.json');

    expect(logger.warn).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();

    expect(res).toMatchInlineSnapshot(`"{"/file1":""}"`);
  });

  test('it resets the cache for a filesmap when a file is added to one of its dependencies', async () => {
    await scaffoldTestFolders([
      ['src/content/tutorial/lesson/_files', { file1: '' }],
      ['src/templates/tmp1', { file1: '', '.tk-config.json': JSON.stringify({ extends: '../tmp2' }) }],
      ['src/templates/tmp2', { file2: '' }],
    ]);

    const folders = await getAllFilesMap(dirs);
    const logger = {
      warn: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
    };
    const server = {
      hot: {
        send: vi.fn(),
      },
    };

    const graph = await FilesMap.initGraph(folders, logger as any);
    const cache = new FilesMapCache(graph, logger as any, server as any, dirs);

    const res = await cache.canHandle('/template-tmp1.json');

    expect(logger.warn).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();

    expect(res).toMatchInlineSnapshot(`"{"/file1":"","/file2":""}"`);

    await fs.writeFile(path.join(tmpDir, 'src/templates/tmp2/file3'), 'new file');

    // invalidate a file in `tmp2`, `tmp1` should also be invalidated
    cache.generateFileMapForPath(path.join(tmpDir, 'src/templates/tmp2/file3'));

    const res2 = await cache.canHandle('/template-tmp1.json');

    expect(logger.warn).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();

    expect(res2).toMatchInlineSnapshot(`"{"/file1":"","/file2":"","/file3":"new file"}"`);
  });

  test('it resets the cache for a filesmap when a config is changed in one of its dependencies', async () => {
    await scaffoldTestFolders([
      ['src/templates/tmp1', { file1: '', '.tk-config.json': JSON.stringify({ extends: '../tmp2' }) }],
      ['src/templates/tmp2', { file2: '', '.tk-config.json': JSON.stringify({ extends: '../tmp3' }) }],
      ['src/templates/tmp3', { file3: '' }],
      ['src/templates/tmp4', { file4: '' }],
    ]);

    const folders = await getAllFilesMap(dirs);
    const logger = {
      warn: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
    };
    const server = {
      hot: {
        send: vi.fn(),
      },
    };

    const graph = await FilesMap.initGraph(folders, logger as any);
    const cache = new FilesMapCache(graph, logger as any, server as any, dirs);

    const res = await cache.canHandle('/template-tmp1.json');

    expect(logger.warn).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();

    expect(res).toMatchInlineSnapshot(`"{"/file1":"","/file2":"","/file3":""}"`);

    // replace config to point to tmp4
    await fs.writeFile(path.join(tmpDir, 'src/templates/tmp2/.tk-config.json'), JSON.stringify({ extends: '../tmp4' }));

    // invalidate a file in `tmp2`, `tmp1` should also be invalidated
    cache.generateFileMapForPath(path.join(tmpDir, 'src/templates/tmp2/file3'));

    const res2 = await cache.canHandle('/template-tmp1.json');

    expect(logger.warn).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();

    expect(res2).toMatchInlineSnapshot(`"{"/file1":"","/file2":"","/file4":""}"`);
  });

  test('it resets the cache for a filesmap when a config is removed in one of its dependencies', async () => {
    await scaffoldTestFolders([
      ['src/templates/tmp1', { file1: '', '.tk-config.json': JSON.stringify({ extends: '../tmp2' }) }],
      ['src/templates/tmp2', { file2: '', '.tk-config.json': JSON.stringify({ extends: '../tmp3' }) }],
      ['src/templates/tmp3', { file3: '' }],
    ]);

    const folders = await getAllFilesMap(dirs);
    const logger = {
      warn: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
    };
    const server = {
      hot: {
        send: vi.fn(),
      },
    };

    const graph = await FilesMap.initGraph(folders, logger as any);
    const cache = new FilesMapCache(graph, logger as any, server as any, dirs);

    const res = await cache.canHandle('/template-tmp1.json');

    expect(logger.warn).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();

    expect(res).toMatchInlineSnapshot(`"{"/file1":"","/file2":"","/file3":""}"`);

    await fs.rm(path.join(tmpDir, 'src/templates/tmp2/.tk-config.json'));

    // invalidate a file in `tmp2`, `tmp1` should also be invalidated
    cache.generateFileMapForPath(path.join(tmpDir, 'src/templates/tmp2/.tk-config.json'));

    const res2 = await cache.canHandle('/template-tmp1.json');

    expect(logger.warn).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();

    expect(res2).toMatchInlineSnapshot(`"{"/file1":"","/file2":""}"`);
  });
});

// TODO: this is shared with filesmap.spec.ts, should we move this to tests-utils?
async function scaffoldTestFolders(folders: [name: string, files: Record<string, string>][]) {
  for (const [name, files] of folders) {
    const folder = path.normalize(path.join(tmpDir, name));
    await fs.mkdir(folder, { recursive: true });

    for (const file in files) {
      const fileContent = files[file];
      await fs.writeFile(path.join(folder, file), fileContent);
    }
  }
}
