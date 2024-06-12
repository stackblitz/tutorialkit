export function folderPathToFilesRef(pathToFolder: string): string {
  return encodeURIComponent(pathToFolder.replaceAll(/[\/\\]+/g, '-').replaceAll('_', '')) + '.json';
}
