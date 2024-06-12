import type { FilesRefList, Files } from '@tutorialkit/types';
import { atom, computed } from 'nanostores';

export interface EditorDocument {
  value: string | Uint8Array;
  loading: boolean;
  filePath: string;
  scroll?: ScrollPosition;
}

export interface ScrollPosition {
  top: number;
  left: number;
}

export type EditorDocuments = Record<string, EditorDocument>;

export class EditorStore {
  selectedFile = atom<string | undefined>();
  documents = atom<EditorDocuments>({});

  currentDocument = computed([this.documents, this.selectedFile], (documents, selectedFile) => {
    if (!selectedFile) {
      return undefined;
    }

    return documents[selectedFile];
  });

  setSelectedFile(filePath: string | undefined) {
    this.selectedFile.set(filePath);
  }

  setDocuments(files: FilesRefList | Files) {
    // check if it is a FilesRef
    if (Array.isArray(files)) {
      this.documents.set(
        Object.fromEntries(
          files[1].map((filePath) => {
            return [
              filePath,
              {
                value: '',
                loading: true,
                filePath,
              },
            ];
          }),
        ),
      );
    } else {
      const previousDocuments = this.documents.value;

      this.documents.set(
        Object.fromEntries(
          Object.entries(files).map(([filePath, value]) => {
            return [
              filePath,
              {
                value,
                loading: false,
                filePath,
                scroll: previousDocuments?.[filePath]?.scroll,
              },
            ];
          }),
        ) satisfies EditorDocuments,
      );
    }
  }

  updateScrollPosition(filePath: string, position: ScrollPosition) {
    const documentState = this.documents.get()[filePath];

    if (!documentState) {
      return;
    }

    documentState.scroll = position;
  }

  updateFile(filePath: string, content: string): boolean {
    const documentState = this.documents.get()[filePath];

    if (!documentState) {
      return false;
    }

    const currentContent = documentState.value;
    const contentChanged = currentContent !== content;

    if (contentChanged) {
      documentState.value = content;
    }

    return contentChanged;
  }
}
