import { describe, it, expect } from 'vitest';
import { folderPathToFilesRef } from './files-ref.js';

describe('folderPathToFilesRef', () => {
  const testCases = [
    ['path/to/folder', 'path-to-folder.json'],
    ['path/to///folder', 'path-to-folder.json'],
    ['files', 'files.json'],
    ['path/to/folder_2', 'path-to-folder2.json'],
    ['path\\to\\folder', 'path-to-folder.json'],
    ['path\\to\\\\\\folder', 'path-to-folder.json'],
  ];

  testCases.forEach(([folderPath, expectedFilesRef]) => {
    it(`should return the files ref for a given folder path - ${folderPath}`, () => {
      const filesRef = folderPathToFilesRef(folderPath);

      expect(filesRef).toBe(expectedFilesRef);
    });
  });
});
