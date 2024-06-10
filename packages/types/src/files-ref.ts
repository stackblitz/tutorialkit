export function folderPathToFilesRef(pathToFolder: string): string {
  return encodeURIComponent(pathToFolder.replaceAll('/', '-').replaceAll('\\', '-').replaceAll('_', '')) + '.json';
}
