import type { Lesson } from '@entities';
import resizePanelStyles from '@styles/resize-panel.module.css';
import { useEffect, useRef, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle, type ImperativePanelHandle } from 'react-resizable-panels';
import { type EditorDocument } from '../CodeMirrorEditor/CodeMirrorEditor';
import EditorPanel from './EditorPanel';
import PreviewPanel from './PreviewPanel';
import TerminalPanel from './TerminalPanel';

interface Props {
  lesson: Lesson;
}

/**
 * This component is the orchestrator between various interactive components.
 */
export default function WorkspacePanel({ lesson }: Props) {
  const { fileTree } = lesson.data;

  const terminalPanelRef = useRef<ImperativePanelHandle>(null);
  const [editorContent, setEditorContent] = useState<EditorDocument | undefined>();

  let terminalSizeRef = useRef(25);

  const onTerminalResize = (size: number, prevSize?: number) => {
    if (size === 0 && prevSize && prevSize > 0) {
      return;
    }

    terminalSizeRef.current = size;
  };

  useEffect(() => {
    if (lesson.data.focus) {
      const fileContent = lesson.files[lesson.data.focus];

      if (typeof fileContent === 'string') {
        setEditorContent({
          value: fileContent,
          filePath: lesson.data.focus,
        });
      }
    }
  }, [lesson]);

  const toggleTerminal = () => {
    const { current: terminal } = terminalPanelRef;

    if (terminal) {
      if (terminal.getSize() === 0) {
        terminal.resize(terminalSizeRef.current || 25);
      } else {
        terminal.collapse();
      }
    }
  };

  return (
    <PanelGroup className={resizePanelStyles.PanelGroup} direction="vertical">
      <Panel defaultSize={50} minSize={10}>
        <EditorPanel showFileTree={fileTree} editorDocument={editorContent} />
      </Panel>
      <PanelResizeHandle className={resizePanelStyles.PanelResizeHandle} hitAreaMargins={{ fine: 5, coarse: 5 }} />
      <Panel defaultSize={25} minSize={10}>
        <PreviewPanel toggleTerminal={toggleTerminal} />
      </Panel>
      <PanelResizeHandle className={resizePanelStyles.PanelResizeHandle} hitAreaMargins={{ fine: 8, coarse: 8 }} />
      <Panel
        defaultSize={25}
        onResize={(size, prevSize) => onTerminalResize(size, prevSize)}
        collapsible
        ref={terminalPanelRef}
      >
        <TerminalPanel />
      </Panel>
    </PanelGroup>
  );
}
