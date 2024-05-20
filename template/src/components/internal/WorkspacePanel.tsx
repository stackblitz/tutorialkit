import type { Files, Lesson } from '@entities/tutorial';
import resizePanelStyles from '@styles/resize-panel.module.css';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle, type ImperativePanelHandle } from 'react-resizable-panels';
import type {
  EditorDocument,
  OnChangeCallback as OnEditorChange,
  OnScrollCallback as OnEditorScroll,
} from '../CodeMirrorEditor/CodeMirrorEditor';
import { tutorialRunner } from '@app/webcontainer/tutorial-runner';
import { lessonFilesFetcher } from '@app/lesson-files';
import { EditorPanel } from './EditorPanel';
import { PreviewPanel, type ImperativePreviewHandle } from './PreviewPanel';
import { TerminalPanel } from './TerminalPanel';
import { newTask } from '@app/webcontainer/utils/tasks';

const DEFAULT_TERMINAL_SIZE = 25;

interface Props {
  lesson: Lesson;
}

interface LoadedFiles {
  solution?: Files;
  files?: Files;
  template?: Files;
}

type EditorState = Record<string, EditorDocument>;

/**
 * This component is the orchestrator between various interactive components.
 */
export function WorkspacePanel({ lesson }: Props) {
  const { fileTree } = lesson.data;

  const terminalPanelRef = useRef<ImperativePanelHandle>(null);
  const previewRef = useRef<ImperativePreviewHandle>(null);
  const terminalExpanded = useRef(false);

  const [loadedFiles, setLoadedFiles] = useState<LoadedFiles>({});
  const [helpAction, setHelpAction] = useState<'solve' | 'reset'>('reset');
  const [editorState, setEditorState] = useState<EditorState>({});
  const [selectedFile, setSelectedFile] = useState<string | undefined>();

  const editorDocument = useMemo(() => {
    if (!selectedFile) {
      return undefined;
    }

    return editorState[selectedFile];
  }, [editorState, selectedFile]);

  const onEditorChange = useCallback<OnEditorChange>(
    (update) => {
      if (!editorDocument) {
        return;
      }

      const { filePath } = editorDocument;
      const documentState = editorState[filePath];

      if (!documentState) {
        return;
      }

      const currentContent = documentState.value;
      const newContent = update.content;
      const contentChanged = currentContent !== newContent;

      documentState.value = newContent;

      if (contentChanged) {
        tutorialRunner.updateFile(filePath, documentState.value);
      }
    },
    [editorDocument, editorState],
  );

  const onEditorScroll = useCallback<OnEditorScroll>(
    (position) => {
      if (!editorDocument) {
        return;
      }

      const { filePath } = editorDocument;

      const documentState = editorState[filePath];

      if (!documentState) {
        return;
      }

      documentState.scroll = position;
    },
    [editorDocument, editorState],
  );

  const updateDocument = useCallback(
    (filePath?: string) => {
      if (!filePath) {
        setSelectedFile(undefined);
        return;
      }

      setSelectedFile(filePath);

      setEditorState((editorState) => {
        const loadedFile = loadedFiles.files?.[filePath];
        const loading = loadedFile === undefined;

        let value: string | Uint8Array = '';

        if (editorState[filePath]?.loading && !loading) {
          value = loadedFile;
        } else {
          value = editorState[filePath]?.value ?? loadedFile ?? '';
        }

        return {
          ...editorState,
          [filePath]: {
            value,
            loading,
            filePath: filePath,
            scroll: editorState[filePath]?.scroll,
          },
        };
      });
    },
    [loadedFiles],
  );

  const onHelpClick = useCallback(() => {
    const setFiles = (files: Files) => {
      setEditorState((editorState) => {
        const newEditorState = { ...editorState };

        for (const filePath in files) {
          newEditorState[filePath] = {
            ...newEditorState[filePath],
            value: files[filePath],
          };
        }

        return newEditorState;
      });

      tutorialRunner.updateFiles(files);
    };

    if (hasSolution(lesson)) {
      setHelpAction((action) => {
        if (action === 'reset') {
          setLoadedFiles((loadedFiles) => {
            setFiles(loadedFiles.files ?? {});

            return loadedFiles;
          });

          return 'solve';
        } else {
          setLoadedFiles((loadedFiles) => {
            setFiles(loadedFiles.solution ?? {});

            return loadedFiles;
          });

          return 'reset';
        }
      });
    } else {
      setLoadedFiles((loadedFiles) => {
        setFiles(loadedFiles.files ?? {});

        return loadedFiles;
      });
    }
  }, [lesson]);

  useEffect(() => {
    setEditorState({});

    tutorialRunner.setPreviews(lesson.data.previews);

    const task = newTask(
      async (signal) => {
        const templatePromise = lessonFilesFetcher.getLessonTemplate(lesson);
        const filesPromise = lessonFilesFetcher.getLessonFiles(lesson);

        const preparePromise = tutorialRunner.prepareFiles({ template: templatePromise, files: filesPromise, signal });

        tutorialRunner.runCommands(lesson.data);

        const [template, solution, files] = await Promise.all([
          templatePromise,
          lessonFilesFetcher.getLessonSolution(lesson),
          filesPromise,
        ]);

        signal.throwIfAborted();

        setLoadedFiles({
          template,
          solution,
          files,
        });

        await preparePromise;

        signal.throwIfAborted();

        if (lesson.data.autoReload) {
          /**
           * @todo This causes some race with the preview where the iframe can show the "wrong" page.
           * I think the reason is that when the ports are different then we render new frames which
           * races against the reload which will internally reset the `src` attribute.
           */
          // previewRef.current?.reload();
        }
      },
      { ignoreCancel: true },
    );

    if (hasSolution(lesson)) {
      setHelpAction('solve');
    } else {
      setHelpAction('reset');
    }

    return () => task.cancel();
  }, [lesson]);

  useEffect(() => {
    if (lesson.data.focus === undefined) {
      setSelectedFile(undefined);
    } else if (loadedFiles.files?.[lesson.data.focus] !== undefined) {
      updateDocument(lesson.data.focus);
    }
  }, [lesson, loadedFiles, updateDocument]);

  const toggleTerminal = useCallback(() => {
    const { current: terminal } = terminalPanelRef;

    if (!terminal) {
      return;
    }

    if (terminal.isCollapsed()) {
      if (!terminalExpanded.current) {
        terminalExpanded.current = true;
        terminal.resize(DEFAULT_TERMINAL_SIZE);
      } else {
        terminal.expand();
      }
    } else {
      terminal.collapse();
    }
  }, [terminalPanelRef]);

  return (
    <PanelGroup className={resizePanelStyles.PanelGroup} direction="vertical">
      <Panel defaultSize={50} minSize={10}>
        <EditorPanel
          showFileTree={fileTree}
          editorDocument={editorDocument}
          lesson={lesson}
          helpAction={helpAction}
          onHelpClick={onHelpClick}
          onFileClick={updateDocument}
          onEditorScroll={onEditorScroll}
          onEditorChange={onEditorChange}
        />
      </Panel>
      <PanelResizeHandle className={resizePanelStyles.PanelResizeHandle} hitAreaMargins={{ fine: 5, coarse: 5 }} />
      <Panel defaultSize={25} minSize={10}>
        <PreviewPanel ref={previewRef} toggleTerminal={toggleTerminal} />
      </Panel>
      <PanelResizeHandle className={resizePanelStyles.PanelResizeHandle} hitAreaMargins={{ fine: 5, coarse: 5 }} />
      <Panel
        defaultSize={25}
        minSize={10}
        collapsible
        ref={terminalPanelRef}
        onExpand={() => {
          terminalExpanded.current = true;
        }}
      >
        <TerminalPanel />
      </Panel>
    </PanelGroup>
  );
}

function hasSolution(lesson: Lesson): boolean {
  return Object.keys(lesson.solution).length >= 1;
}
