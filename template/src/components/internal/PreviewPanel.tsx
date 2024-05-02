import { forwardRef } from 'react';
import { Preview, type ImperativePreviewHandle } from '../Preview';

interface Props {
  toggleTerminal?: () => void;
}

export const PreviewPanel = forwardRef<ImperativePreviewHandle, Props>(({ toggleTerminal }, ref) => {
  return (
    <div className="panel-container">
      <div className="panel-header border-y border-panel-border justify-between">
        <div className="panel-title">
          <div className="i-ph-globe-duotone"></div>
          <span className="text-sm">Preview</span>
        </div>
        <button
          className="panel-button px-2 py-0.5 -mr-1 -my-1"
          title="Toggle Terminal"
          onClick={() => toggleTerminal?.()}
        >
          <div className="i-ph-terminal-window-duotone"></div>
          <span className="text-sm">Toggle Terminal</span>
        </button>
      </div>
      <div className="h-full">
        <Preview ref={ref} />
      </div>
    </div>
  );
});
