interface Props {
  toggleTerminal?: () => void;
}

export default function PreviewPanel({ toggleTerminal }: Props) {
  return (
    <div className="panel-container">
      <div className="panel-header border-y border-border-gray">
        <div className="i-ph-globe-duotone panel-icon-size"></div>
        <span>Preview</span>
        <button className="ml-auto p-1" title="Hide Terminal" onClick={(event) => toggleTerminal?.()}>
          <div className="i-ph-terminal-window-duotone panel-icon-size"></div>
        </button>
      </div>
      <div className="h-full">Preview Here</div>
    </div>
  );
}
