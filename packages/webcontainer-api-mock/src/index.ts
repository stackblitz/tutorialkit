import type { DirectoryNode, FileNode, FileSystemTree, WebContainer } from '@webcontainer/api';
import { vi, type Mocked } from 'vitest';
import path from 'node:path';

export type MockedWebContainer = Mocked<WebContainer> & {
  _fakeFs: FileSystemTree;
};

vi.mock('@webcontainer/api', () => {
  const WebContainer = vi.fn<[], MockedWebContainer>(function (this: MockedWebContainer) {
    this.fs = {
      readdir: vi.fn(async () => []),
      readFile: vi.fn(async (filePath) => {
        const fileNode = getFileNode(this._fakeFs, filePath);

        if (!fileNode) {
          throw new Error(`No file found at ${filePath}`);
        }

        return fileNode.file.contents as any;
      }),
      writeFile: vi.fn(async (filePath, contents) => {
        const parentFolder = path.dirname(filePath);
        const folderNode = getDirNode(this._fakeFs, parentFolder);

        if (!folderNode) {
          throw new Error(`No folder found at ${parentFolder}`);
        }

        folderNode.directory[path.basename(filePath)] = { file: { contents } };
      }),
      mkdir: vi.fn(async () => '' as any),
      rm: vi.fn(async (filePath, { recursive } = {}) => {
        const parentFolder = path.dirname(filePath);
        const folderNode = getDirNode(this._fakeFs, parentFolder);

        if (!folderNode) {
          throw new Error(`No folder found at ${parentFolder}`);
        }

        const fileName = path.basename(filePath);

        if (!recursive && 'directory' in folderNode.directory[fileName]) {
          throw new Error(`Cannot recursively delete folder ${filePath}`);
        }

        delete folderNode.directory[fileName];
      }),
      rename: vi.fn(async () => {}),
      watch: vi.fn(() => ({
        close: vi.fn(),
      })),
    };

    this._fakeFs = {};

    return this;
  });

  (WebContainer as any).boot = vi.fn(async () => {
    return new WebContainer();
  });

  WebContainer.prototype.spawn = vi.fn(async () => {
    return {
      id: '1',
      exitCode: 0,
      stdout: '',
      stderr: '',
    };
  });

  WebContainer.prototype.dispose = vi.fn();

  WebContainer.prototype.mount = vi.fn(async function (this: MockedWebContainer, tree: FileSystemTree) {
    mergeFileSystem(this._fakeFs, tree);
  });

  return { WebContainer };
});

function mergeFileSystem(mergedTree: FileSystemTree, incomingTree: FileSystemTree) {
  for (const [path, value] of Object.entries(incomingTree)) {
    if ('file' in value) {
      mergedTree[path] = value;
    } else {
      let subTree: FileSystemTree;

      if (mergedTree[path] && 'directory' in mergedTree[path]) {
        subTree = (mergedTree[path] as DirectoryNode).directory;
      } else {
        subTree = {};
        mergedTree[path] = {
          directory: subTree,
        };
      }

      mergeFileSystem(subTree, value.directory);
    }
  }
}

function getFileNode(tree: FileSystemTree, filePath: string): FileNode | undefined {
  const node = getNode(tree, filePath);

  if (node && 'file' in node) {
    return node;
  }
}

function getDirNode(tree: FileSystemTree, filePath: string): DirectoryNode | undefined {
  const node = getNode(tree, filePath);

  if (node && 'directory' in node) {
    return node;
  }
}

function getNode(tree: FileSystemTree, filePath: string): FileNode | DirectoryNode | undefined {
  const segments = filePath.split('/');

  for (let i = 0; i < segments.length; ++i) {
    const segment = segments[i];

    if (segment.length === 0) {
      continue;
    }

    const node = tree[segment];

    if (!node) {
      return undefined;
    }

    // if we reached the end of the path
    if (i === segments.length - 1) {
      return node;
    }

    // if not we continue if it's a directory
    if ('directory' in node) {
      tree = node.directory;
      continue;
    }

    // if the path think the current segment is not a file then we need to return undefined
    return undefined;
  }
}
