import resizePanelStyles from '@styles/resize-panel.module.css';
import { useRef } from 'react';
import { Panel, PanelGroup, PanelResizeHandle, type ImperativePanelHandle } from 'react-resizable-panels';
import EditorPanel from './EditorPanel';
import PreviewPanel from './PreviewPanel';
import TerminalPanel from './TerminalPanel';

/**
 * This component is the orchestrator between various interactive components.
 */
export default function WorkspacePanel() {
  const terminalPanelRef = useRef<ImperativePanelHandle>(null);

  const toggleTerminal = () => {
    const { current } = terminalPanelRef;

    if (current) {
      if (current.isCollapsed()) {
        current.expand();
      } else {
        current.collapse();
      }
    }
  };

  return (
    <PanelGroup className={resizePanelStyles.PanelGroup} direction="vertical">
      <Panel defaultSize={50} minSize={10}>
        <EditorPanel />
      </Panel>
      <PanelResizeHandle className={resizePanelStyles.PanelResizeHandle} hitAreaMargins={{ fine: 5, coarse: 5 }} />
      <Panel defaultSize={50} minSize={10}>
        <PreviewPanel toggleTerminal={toggleTerminal} />
      </Panel>
      <PanelResizeHandle className={resizePanelStyles.PanelResizeHandle} hitAreaMargins={{ fine: 8, coarse: 8 }} />
      <Panel defaultSize={50} collapsible ref={terminalPanelRef}>
        <TerminalPanel />
      </Panel>
    </PanelGroup>
  );
}
