import type { Lesson } from '@entities/tutorial';
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
import { PreviewPanel } from './PreviewPanel';
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
  const terminalExpanded = useRef(false);
  const tutorialRunner = useContext(TutorialRunnerContext);

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
      if (!update.view.hasFocus || !editorDocument) {
        return;
      }

      const { filePath } = editorDocument;
      const documentState = editorState[filePath];

      if (!documentState) {
        return;
      }

      const currentContent = documentState.value;
      const newContent = update.view.state.doc.toString();
      const contentChanged = currentContent !== newContent;

      documentState.selection = update.state.selection;
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

      if (editorDocument?.filePath !== filePath) {
        setEditorState((editorState) => {
          return {
            ...editorState,
            [filePath]: {
              value: editorState[filePath]?.value ?? lesson.files[filePath] ?? '',
              filePath: filePath,
              scroll: editorState[filePath]?.scroll,
              selection: editorState[filePath]?.selection,
            },
          };
        });
      }
    },
    [lesson, editorDocument]
  );

  useEffect(() => {
    setEditorState({});
    tutorialRunner.prepareFiles(lesson);
    tutorialRunner.runCommands(lesson.data);
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
          onFileClick={updateDocument}
          onEditorScroll={onEditorScroll}
          onEditorChange={onEditorChange}
        />
      </Panel>
      <PanelResizeHandle className={resizePanelStyles.PanelResizeHandle} hitAreaMargins={{ fine: 5, coarse: 5 }} />
      <Panel defaultSize={25} minSize={10}>
        <PreviewPanel toggleTerminal={toggleTerminal} />
      </Panel>
      <PanelResizeHandle className={resizePanelStyles.PanelResizeHandle} hitAreaMargins={{ fine: 8, coarse: 8 }} />
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
