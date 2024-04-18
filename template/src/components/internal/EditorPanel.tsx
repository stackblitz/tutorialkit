import resizePanelStyles from '@styles/resize-panel.module.css';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

export default function EditorPanel() {
  return (
    <PanelGroup className={resizePanelStyles.PanelGroup} direction="horizontal">
      <Panel defaultSize={50} minSize={0}>
        File Tree
      </Panel>
      <PanelResizeHandle className={resizePanelStyles.PanelResizeHandle} hitAreaMargins={{ fine: 5, coarse: 5 }} />
      <Panel defaultSize={50} minSize={10}>
        <div className="h-full border-l border-border-gray">Editor</div>
      </Panel>
    </PanelGroup>
  );
}
