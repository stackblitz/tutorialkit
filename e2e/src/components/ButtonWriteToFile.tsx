import tutorialStore from 'tutorialkit:store';
import { webcontainer } from 'tutorialkit:core';

interface Props {
  filePath: string;
  newContent: string;
  useWebcontainer?: boolean;
  testId?: string;
}

export function ButtonWriteToFile({ filePath, newContent, useWebcontainer = false, testId = 'write-to-file' }: Props) {
  async function writeFile() {
    if (useWebcontainer) {
      const webcontainerInstance = await webcontainer;

      await webcontainerInstance.fs.writeFile(filePath, newContent);

      return;
    }

    await new Promise<void>((resolve) => {
      tutorialStore.lessonFullyLoaded.subscribe((value) => {
        if (value) {
          resolve();
        }
      });
    });

    tutorialStore.updateFile(filePath, newContent);
  }

  return (
    <button data-testid={testId} onClick={writeFile}>
      Write to File
    </button>
  );
}
