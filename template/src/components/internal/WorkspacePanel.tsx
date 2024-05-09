import type { Files, Lesson } from '@entities/tutorial';
import resizePanelStyles from '@styles/resize-panel.module.css';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle, type ImperativePanelHandle } from 'react-resizable-panels';
import type {
  EditorDocument,
  OnChangeCallback as OnEditorChange,
  OnScrollCallback as OnEditorScroll,
} from '../CodeMirrorEditor/CodeMirrorEditor';
import { TutorialRunnerContext } from '../webcontainer/tutorial-runner';
import { EditorPanel } from './EditorPanel';
import { PreviewPanel, type ImperativePreviewHandle } from './PreviewPanel';
import { TerminalPanel } from './TerminalPanel';

const DEFAULT_TERMINAL_SIZE = 25;

interface Props {
  lesson: Lesson;
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

  const tutorialRunner = useContext(TutorialRunnerContext);

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
        return {
          ...editorState,
          [filePath]: {
            value: editorState[filePath]?.value ?? lesson.files[filePath] ?? '',
            filePath: filePath,
            scroll: editorState[filePath]?.scroll,
          },
        };
      });
    },
    [lesson],
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
          setFiles(lesson.files);

          return 'solve';
        } else {
          setFiles(lesson.solution);

          return 'reset';
        }
      });
    } else {
      setFiles(lesson.files);
    }
  }, [lesson]);

  useEffect(() => {
    setEditorState({});

    tutorialRunner.setPreviews(lesson.data.previews);

    tutorialRunner.prepareFiles(lesson).then((cancelled) => {
      if (!cancelled && lesson.data.autoReload) {
        /**
         * @todo This causes some race with the preview where the iframe can show the "wrong" page.
         * I think the reason is that when the ports are different then we render new frames which
         * races against the reload which will internally reset the `src` attribute.
         */
        // previewRef.current?.reload();
      }
    });

    tutorialRunner.runCommands(lesson.data);

    if (hasSolution(lesson)) {
      setHelpAction('solve');
    } else {
      setHelpAction('reset');
    }
  }, [lesson]);

  useEffect(() => {
    updateDocument(lesson.data.focus);
  }, [lesson, updateDocument]);

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
