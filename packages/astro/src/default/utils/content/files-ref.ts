import path from 'node:path';
import type { FilesRefList } from '@tutorialkit/types';
import { folderPathToFilesRef } from '@tutorialkit/types';
import glob from 'fast-glob';
import { IGNORED_FILES } from '../constants';

const CONTENT_DIR = path.join(process.cwd(), 'src/content/tutorial');

export async function getFilesRefList(pathToFolder: string, base = CONTENT_DIR): Promise<FilesRefList> {
  const root = path.join(base, pathToFolder);

  const filePaths = (
    await glob(`${glob.convertPathToPattern(root)}/**/*`, {
      onlyFiles: true,
      ignore: IGNORED_FILES,
      dot: true,
    })
  ).map((filePath) => `/${path.relative(root, filePath).replaceAll(path.sep, '/')}`);

  filePaths.sort();

  const filesRef = folderPathToFilesRef(pathToFolder);

  return [filesRef, filePaths];
}
