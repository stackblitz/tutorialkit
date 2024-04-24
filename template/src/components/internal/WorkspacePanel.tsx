import type { Lesson } from '@entities/tutorial';
import resizePanelStyles from '@styles/resize-panel.module.css';
import { useContext, useEffect, useRef, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle, type ImperativePanelHandle } from 'react-resizable-panels';
import { type EditorDocument } from '../CodeMirrorEditor/CodeMirrorEditor';
import EditorPanel from './EditorPanel';
import PreviewPanel from './PreviewPanel';
import TerminalPanel from './TerminalPanel';
import { TutorialRunnerContext } from '@components/webcontainer/tutorial-runner';

const DEFAULT_TERMINAL_SIZE = 25;

interface Props {
  lesson: Lesson;
}

/**
 * This component is the orchestrator between various interactive components.
 */
export default function WorkspacePanel({ lesson }: Props) {
  const { fileTree } = lesson.data;

  const terminalPanelRef = useRef<ImperativePanelHandle>(null);
  const [editorDocument, setEditorDocument] = useState<EditorDocument | undefined>();
  const terminalExpanded = useRef(false);
  const tutorialRunner = useContext(TutorialRunnerContext);

  const updateDocument = (filePath?: string) => {
    if (!filePath) {
      setEditorDocument(undefined);
      return;
    }

    const fileContent = lesson.files[filePath];

    if (typeof fileContent === 'string' && editorDocument?.filePath !== filePath) {
      setEditorDocument({
        value: fileContent,
        filePath: filePath,
      });
    }
  };

  useEffect(() => {
    updateDocument(lesson.data.focus);
  }, [lesson]);

  useEffect(() => {
    tutorialRunner.loadFiles(lesson);
    tutorialRunner.runCommands(lesson.data);
  }, [lesson]);

  const toggleTerminal = () => {
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
  };

  return (
    <PanelGroup className={resizePanelStyles.PanelGroup} direction="vertical">
      <Panel defaultSize={50} minSize={10}>
        <EditorPanel
          showFileTree={fileTree}
          editorDocument={editorDocument}
          lesson={lesson}
          onFileClick={updateDocument}
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
