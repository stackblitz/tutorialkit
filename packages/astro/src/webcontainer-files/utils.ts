import { folderPathToFilesRef } from '@tutorialkit/types';
import glob from 'fast-glob';
import { FILES_FOLDER_NAME, IGNORED_FILES, SOLUTION_FOLDER_NAME } from './constants.js';

export interface ContentDirs {
  templatesDir: string;
  contentDir: string;
}

export function getFilesRef(pathToFolder: string, { contentDir, templatesDir }: ContentDirs) {
  if (pathToFolder.startsWith(contentDir)) {
    pathToFolder = pathToFolder.slice(contentDir.length + 1);
  } else if (pathToFolder.startsWith(templatesDir)) {
    pathToFolder = 'template' + pathToFolder.slice(templatesDir.length);
  }

  return folderPathToFilesRef(pathToFolder);
}

export function getAllFilesMap({ contentDir, templatesDir }: ContentDirs) {
  return glob(
    [
      `${glob.convertPathToPattern(contentDir)}/**/${FILES_FOLDER_NAME}`,
      `${glob.convertPathToPattern(contentDir)}/**/${SOLUTION_FOLDER_NAME}`,
      `${glob.convertPathToPattern(templatesDir)}/*`,
    ],
    { onlyDirectories: true, ignore: IGNORED_FILES },
  );
}
