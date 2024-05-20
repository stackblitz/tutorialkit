import type { Files } from '@tutorialkit/types';
import type { DirectoryNode, FileNode, FileSystemTree } from '@webcontainer/api';

type FileSystemTreeNode = DirectoryNode | FileNode | undefined;

export function areFilesEqual(a: Files, b: Files) {
  const aFilePaths = Object.keys(a);
  const bFilePaths = Object.keys(b);

  if (aFilePaths.length !== bFilePaths.length) {
    return false;
  }

  aFilePaths.sort();
  bFilePaths.sort();

  for (let i = 0; i < aFilePaths.length; ++i) {
    const filePath = aFilePaths[i];

    if (bFilePaths[i] !== filePath) {
      return false;
    }

    if (a[filePath] !== b[filePath]) {
      return false;
    }
  }

  return true;
}

interface FilesDiff {
  addedOrModified: Files;
  removed: string[];
}

export function diffFiles(before: Files, after: Files): FilesDiff {
  const addedOrModified: Files = {};
  const removed: string[] = [];

  for (const filePath in before) {
    const beforeFile = before[filePath];
    const afterFile = after[filePath];

    if (typeof afterFile == 'undefined') {
      removed.push(filePath);
    } else if (beforeFile !== afterFile) {
      addedOrModified[filePath] = afterFile;
    }
  }

  for (const filePath in after) {
    if (!(filePath in before)) {
      addedOrModified[filePath] = after[filePath];
    }
  }

  return {
    addedOrModified,
    removed,
  };
}

export function toFileTree(files: Files): FileSystemTree {
  const root: FileSystemTree = {};

  for (const filePath in files) {
    const segments = filePath.split('/').filter((segment) => segment);

    let currentTree: FileSystemTree = root;

    for (let i = 0; i < segments.length; ++i) {
      const name = segments[i];

      if (i === segments.length - 1) {
        currentTree[name] = {
          file: {
            contents: files[filePath],
          },
        };
      } else {
        let folder = currentTree[name] as FileSystemTreeNode;

        assertDirectoryNode(folder);

        if (!folder) {
          folder = {
            directory: {},
          };

          currentTree[name] = folder;
        }

        currentTree = folder.directory;
      }
    }
  }

  return root;
}

function assertDirectoryNode(node: FileSystemTreeNode): asserts node is DirectoryNode | undefined {
  if (node && !('directory' in node)) {
    throw new Error('Expected directory node');
  }
}
