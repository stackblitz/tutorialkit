import { folderPathToFilesRef } from '@tutorialkit/types';

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
