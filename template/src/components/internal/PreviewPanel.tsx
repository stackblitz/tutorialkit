import { forwardRef } from 'react';
import { Preview, type ImperativePreviewHandle } from '../Preview';

interface Props {
  toggleTerminal?: () => void;
}

export const PreviewPanel = forwardRef<ImperativePreviewHandle, Props>(({ toggleTerminal }, ref) => {
  return (
    <div className="panel-container">
      <div className="panel-header border-y border-panel-border">
        <div className="i-ph-globe-duotone"></div>
        <span className="text-sm">Preview</span>
        <button
          className="ml-auto hover:bg-gray-100 rounded-sm"
          title="Hide Terminal"
          onClick={(event) => toggleTerminal?.()}
        >
          <div className="i-ph-terminal-window-duotone"></div>
        </button>
      </div>
      <div className="h-full">
        <Preview ref={ref} />
      </div>
    </div>
  );
});
