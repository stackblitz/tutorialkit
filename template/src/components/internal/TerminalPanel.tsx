import Terminal from '../Terminal';

interface Props {
  onClose: () => void;
}

export default function TerminalPanel() {
  return (
    <div className="panel-container">
      <div className="panel-header border-y border-panel-border">
        <div className="i-ph-terminal-window-duotone panel-icon-size"></div>
        <span>Terminal</span>
      </div>
      <div className="h-full">
        <Terminal />
      </div>
    </div>
  );
}
