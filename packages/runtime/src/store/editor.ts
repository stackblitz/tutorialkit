import type { FilesRefList, Files, EditorSchema, FileDescriptor } from '@tutorialkit/types';
import { atom, map, computed } from 'nanostores';
import { EditorConfig } from '../webcontainer/editor-config.js';

export interface EditorDocument {
  value: string | Uint8Array;
  loading: boolean;
  filePath: string;
  type: FileDescriptor['type'];
  scroll?: ScrollPosition;
}

export interface ScrollPosition {
  top: number;
  left: number;
}

export type EditorDocuments = Record<string, EditorDocument | undefined>;

export class EditorStore {
  editorConfig = atom<EditorConfig>(new EditorConfig());
  selectedFile = atom<string | undefined>();
  documents = map<EditorDocuments>({});

  files = computed(this.documents, (documents) =>
    Object.entries(documents).map<FileDescriptor>(([path, doc]) => ({ path, type: doc?.type || 'file' })),
  );
  currentDocument = computed([this.documents, this.selectedFile], (documents, selectedFile) => {
    if (!selectedFile) {
      return undefined;
    }

    return documents[selectedFile];
  });

  setEditorConfig(config?: EditorSchema) {
    this.editorConfig.set(new EditorConfig(config));
  }

  setSelectedFile(filePath: string | undefined) {
    this.selectedFile.set(filePath);
  }

  setDocuments(files: FilesRefList | Files) {
    // lesson, solution and template file entries are always files  - empty folders are not supported
    const type = 'file';

    // check if it is a FilesRef
    if (Array.isArray(files)) {
      this.documents.set(
        Object.fromEntries(
          files[1].map((filePath) => {
            return [
              filePath,
              {
                value: '',
                type,
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
                type,
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

    this.documents.setKey(filePath, {
      ...documentState,
      scroll: position,
    });
  }

  addFileOrFolder(file: FileDescriptor) {
    // when adding file or folder to empty folder, remove the empty folder from documents
    const emptyFolder = this.files.get().find((f) => file.path.startsWith(f.path));

    if (emptyFolder) {
      this.documents.setKey(emptyFolder.path, undefined);
    }

    this.documents.setKey(file.path, {
      filePath: file.path,
      type: file.type,
      value: '',
      loading: false,
    });
  }

  updateFile(filePath: string, content: string | Uint8Array): boolean {
    const documentState = this.documents.get()[filePath];

    if (!documentState) {
      return false;
    }

    const currentContent = documentState.value;
    const contentChanged = currentContent !== content;

    if (contentChanged) {
      this.documents.setKey(filePath, {
        ...documentState,
        value: content,
      });
    }

    return contentChanged;
  }

  deleteFile(filePath: string): boolean {
    const documentState = this.documents.get()[filePath];

    if (!documentState) {
      return false;
    }

    this.documents.setKey(filePath, undefined);

    return true;
  }

  onDocumentChanged(filePath: string, callback: (document: Readonly<EditorDocument>) => void) {
    const unsubscribeFromCurrentDocument = this.currentDocument.subscribe((document) => {
      if (document?.filePath === filePath) {
        callback(document);
      }
    });

    const unsubscribeFromDocuments = this.documents.subscribe((documents) => {
      const document = documents[filePath];

      /**
       * We grab the document from the store, but only call the callback if it is not loading anymore which means
       * the content is loaded.
       */
      if (document && !document.loading) {
        /**
         * Call this in a `queueMicrotask` because the subscribe callback is called synchronoulsy,
         * which causes the `unsubscribeFromDocuments` to not exist yet.
         */
        queueMicrotask(() => {
          callback(document);

          unsubscribeFromDocuments();
        });
      }
    });

    return () => {
      unsubscribeFromDocuments();

      unsubscribeFromCurrentDocument();
    };
  }
}
