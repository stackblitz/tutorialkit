import fs from 'node:fs/promises';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, assert, it, test, vi } from 'vitest';
import { FilesMap, FilesMapGraph } from './filesmap.js';

const tmpDir = path.join(__dirname, `.tmp-${path.basename(__filename)}`);

beforeEach(async () => {
  await fs.rm(tmpDir, { force: true, recursive: true });
  await fs.mkdir(tmpDir);
});

afterEach(async () => {
  await fs.rm(tmpDir, { force: true, recursive: true });
});

describe('FilesMap', () => {
  it('should initialize the graph of nodes by connecting them to one another', async () => {
    await scaffoldTestFolders([
      ['folder1', { file1: '' }],
      ['folder2', { file2: '' }],
    ]);

    const folders = [path.join(tmpDir, 'folder1'), path.join(tmpDir, 'folder2')];
    const logger = {
      warn: vi.fn(),
    };
    const graph = await FilesMap.initGraph(folders, logger as any);

    const node1 = getFilesMapByFolder(graph, folders[0]);
    const node2 = getFilesMapByFolder(graph, folders[1]);

    expect(logger.warn).not.toHaveBeenCalled();

    expect(await node1.toFiles(logger as any)).toMatchInlineSnapshot(`
      {
        "/file1": "",
      }
    `);
    expect(await node2.toFiles(logger as any)).toMatchInlineSnapshot(`
      {
        "/file2": "",
      }
    `);
  });

  it('should warn when a cycle is found', async () => {
    await scaffoldTestFolders([
      ['folder1', { file1: '', '.tk-config.json': JSON.stringify({ extends: '../folder2' }) }],
      ['folder2', { file2: '', '.tk-config.json': JSON.stringify({ extends: '../folder1' }) }],
    ]);

    const folders = [path.join(tmpDir, 'folder1'), path.join(tmpDir, 'folder2')];
    const logger = {
      warn: vi.fn(),
    };
    const graph = await FilesMap.initGraph(folders, logger as any);

    const node1 = getFilesMapByFolder(graph, folders[0]);
    const node2 = getFilesMapByFolder(graph, folders[1]);

    expect(await node1.toFiles(logger as any)).toMatchInlineSnapshot(`
      {
        "/file1": "",
        "/file2": "",
      }
    `);
    expect(await node2.toFiles(logger as any)).toMatchInlineSnapshot(`
      {
        "/file1": "",
        "/file2": "",
      }
    `);

    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Cycle detected'));
    expect(logger.warn).toHaveBeenCalledTimes(2);
  });

  it('should support multiple levels of extension', async () => {
    await scaffoldTestFolders([
      ['folder1', { file1: '', '.tk-config.json': JSON.stringify({ extends: '../folder2' }) }],
      ['folder2', { file2: '', '.tk-config.json': JSON.stringify({ extends: '../folder3' }) }],
      ['folder3', { file3: '' }],
    ]);

    const folders = [path.join(tmpDir, 'folder1'), path.join(tmpDir, 'folder2'), path.join(tmpDir, 'folder3')];
    const logger = {
      warn: vi.fn(),
    };
    const graph = await FilesMap.initGraph(folders, logger as any);

    const node1 = getFilesMapByFolder(graph, folders[0]);
    const node2 = getFilesMapByFolder(graph, folders[1]);
    const node3 = getFilesMapByFolder(graph, folders[2]);

    expect(await node1.toFiles(logger as any)).toMatchInlineSnapshot(`
      {
        "/file1": "",
        "/file2": "",
        "/file3": "",
      }
    `);
    expect(await node2.toFiles(logger as any)).toMatchInlineSnapshot(`
      {
        "/file2": "",
        "/file3": "",
      }
    `);
    expect(await node3.toFiles(logger as any)).toMatchInlineSnapshot(`
      {
        "/file3": "",
      }
    `);
  });

  test('allDependents should return all the file map that must be regenerated when that one changes', async () => {
    await scaffoldTestFolders([
      ['folder1', { file1: '', '.tk-config.json': JSON.stringify({ extends: '../folder2' }) }],
      ['folder2', { file2: '', '.tk-config.json': JSON.stringify({ extends: '../folder3' }) }],
      ['folder3', { file3: '' }],
    ]);

    const folders = [path.join(tmpDir, 'folder1'), path.join(tmpDir, 'folder2'), path.join(tmpDir, 'folder3')];
    const logger = {
      warn: vi.fn(),
    };
    const graph = await FilesMap.initGraph(folders, logger as any);

    const node1 = getFilesMapByFolder(graph, folders[0]);
    const node2 = getFilesMapByFolder(graph, folders[1]);
    const node3 = getFilesMapByFolder(graph, folders[2]);

    const dependents = [...node3.allDependents()];

    expect(dependents).toHaveLength(2);
    expect(dependents).toContain(node1);
    expect(dependents).toContain(node2);
  });

  test('unlink should remove the dependency between two nodes', async () => {
    await scaffoldTestFolders([
      ['folder1', { file1: '', '.tk-config.json': JSON.stringify({ extends: '../folder2' }) }],
      ['folder2', { file2: '', '.tk-config.json': JSON.stringify({ extends: '../folder3' }) }],
      ['folder3', { file3: '' }],
    ]);

    const folders = [path.join(tmpDir, 'folder1'), path.join(tmpDir, 'folder2'), path.join(tmpDir, 'folder3')];
    const logger = {
      warn: vi.fn(),
    };
    const graph = await FilesMap.initGraph(folders, logger as any);

    const node1 = getFilesMapByFolder(graph, folders[0]);
    const node2 = getFilesMapByFolder(graph, folders[1]);
    const node3 = getFilesMapByFolder(graph, folders[2]);

    node1.unlink();

    const dependents3 = [...node3.allDependents()];
    const dependents2 = [...node2.allDependents()];

    expect(dependents2).toHaveLength(0);

    expect(dependents3).toHaveLength(1);
    expect(dependents3).not.toContain(node1);
    expect(dependents3).toContain(node2);
  });

  test('update should remove the node from the graph if the config file is missing', async () => {
    await scaffoldTestFolders([
      ['folder1', { file1: '', '.tk-config.json': JSON.stringify({ extends: '../folder2' }) }],
      ['folder2', { file2: '' }],
    ]);

    const folders = [path.join(tmpDir, 'folder1'), path.join(tmpDir, 'folder2')];
    const logger = {
      warn: vi.fn(),
    };
    const graph = await FilesMap.initGraph(folders, logger as any);

    const node1 = getFilesMapByFolder(graph, folders[0]);
    const node2 = getFilesMapByFolder(graph, folders[1]);

    const dependents = [...node2.allDependents()];

    expect(dependents).toHaveLength(1);

    // now we remove the config
    await fs.unlink(path.join(node1.path, '.tk-config.json'));

    graph.updateFilesMapByFolder(node1.path, logger as any);

    const newDependents = [...node2.allDependents()];

    expect(newDependents).toHaveLength(0);
  });

  test('update should connect two node in the graph if the config file is added', async () => {
    await scaffoldTestFolders([
      ['folder1', { file1: '' }],
      ['folder2', { file2: '' }],
    ]);

    const folders = [path.join(tmpDir, 'folder1'), path.join(tmpDir, 'folder2')];
    const logger = {
      warn: vi.fn(),
    };
    const graph = await FilesMap.initGraph(folders, logger as any);

    const node1 = getFilesMapByFolder(graph, folders[0]);
    const node2 = getFilesMapByFolder(graph, folders[1]);

    const dependents = [...node2.allDependents()];

    expect(dependents).toHaveLength(0);

    // now we add the config
    await fs.writeFile(path.join(node1.path, '.tk-config.json'), JSON.stringify({ extends: '../folder2' }));

    graph.updateFilesMapByFolder(node1.path, logger as any);

    const newDependents = [...node2.allDependents()];

    expect(newDependents).toHaveLength(1);
    expect(newDependents).toContain(node1);
  });

  test('update should add a new node in the graph if the config file points to a folder that was not in the graph initially', async () => {
    await scaffoldTestFolders([
      ['folder1', { file1: '' }],
      ['folder2', { file2: '' }],
    ]);

    const folders = [path.join(tmpDir, 'folder1'), path.join(tmpDir, 'folder2')];
    const folder3 = path.join(tmpDir, 'folder3');
    const logger = {
      warn: vi.fn(),
    };
    const graph = await FilesMap.initGraph(folders, logger as any);

    const node1 = getFilesMapByFolder(graph, folders[0]);

    expect(graph.getFilesMapByFolder(folder3)).toBeUndefined();

    // now we add the config and the new folder
    await fs.writeFile(path.join(node1.path, '.tk-config.json'), JSON.stringify({ extends: '../folder3' }));
    await fs.mkdir(folder3);

    graph.updateFilesMapByFolder(node1.path, logger as any);

    const node3 = getFilesMapByFolder(graph, folder3);

    const newDependents = [...node3.allDependents()];

    expect(newDependents).toHaveLength(1);
    expect(newDependents).toContain(node1);
  });
});

async function scaffoldTestFolders(folders: [name: string, files: Record<string, string>][]) {
  for (const [name, files] of folders) {
    const folder = path.join(tmpDir, name);
    await fs.mkdir(folder, { recursive: true });

    for (const file in files) {
      const fileContent = files[file];
      await fs.writeFile(path.join(folder, file), fileContent);
    }
  }
}

function getFilesMapByFolder(graph: FilesMapGraph, folder: string) {
  const node = graph.getFilesMapByFolder(folder);

  assert(node !== undefined);

  return node;
}
