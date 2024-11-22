import { webcontainer } from 'tutorialkit:core';

interface Props {
  filePath: string;
  newContent: string;

  // default to 'webcontainer'
  access?: 'store' | 'webcontainer';
  testId?: string;
}

export function ButtonDeleteFile({ filePath, access = 'webcontainer', testId = 'delete-file' }: Props) {
  async function deleteFile() {
    switch (access) {
      case 'webcontainer': {
        const webcontainerInstance = await webcontainer;

        await webcontainerInstance.fs.rm(filePath);

        return;
      }
      case 'store': {
        throw new Error('Delete from store not implemented');
        return;
      }
    }
  }

  return (
    <button data-testid={testId} onClick={deleteFile}>
      Delete File
    </button>
  );
}
