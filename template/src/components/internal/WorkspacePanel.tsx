import type { Lesson } from '@entities/tutorial';
import resizePanelStyles from '@styles/resize-panel.module.css';
import { useEffect, useRef, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle, type ImperativePanelHandle } from 'react-resizable-panels';
import { type EditorDocument } from '../CodeMirrorEditor/CodeMirrorEditor';
import EditorPanel from './EditorPanel';
import PreviewPanel from './PreviewPanel';
import TerminalPanel from './TerminalPanel';

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

  const updateDocument = (filePath?: string) => {
    if (!filePath) {
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

  const toggleTerminal = () => {
    const { current: terminal } = terminalPanelRef;

    if (!terminal) {
      return;
    }

    if (terminal.isCollapsed()) {
      terminal.expand();
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
      <Panel defaultSize={DEFAULT_TERMINAL_SIZE} minSize={10} collapsible ref={terminalPanelRef}>
        <TerminalPanel />
      </Panel>
    </PanelGroup>
  );
}
