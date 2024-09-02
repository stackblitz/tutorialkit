import tutorialStore from 'tutorialkit:store';

interface Props {
  filePath: string;
  newContent: string;
  testId?: string;
}

export function ButtonWriteToFile({ filePath, newContent, testId = 'write-to-file' }: Props) {
  async function writeFile() {
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
