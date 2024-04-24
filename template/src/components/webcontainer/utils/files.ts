import type { Files } from '@entities/tutorial';
import type { FileSystemTree } from '@webcontainer/api';

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
}

export function toFileTree(files: Files): FileSystemTree {
  const root: FileSystemTree = {};

  for (const filePath in files) {
    const segments = filePath.split('/').filter((s) => s);

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
        const folder = {
          directory: {},
        };
        currentTree[name] = folder;
        currentTree = folder.directory;
      }
    }
  }

  return root;
}
