import { BootScreen } from '@components/BootScreen';
import type { PreviewInfo } from '@components/webcontainer/preview-info';
import { useStore } from '@nanostores/react';
import resizePanelStyles from '@styles/resize-panel.module.css';
import { createElement, forwardRef, useContext, useImperativeHandle } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { TutorialRunnerContext } from '../webcontainer/tutorial-runner';

interface Props {
  toggleTerminal?: () => void;
}

export type ImperativePreviewHandle = {
  reload: () => void;
};

export const PreviewPanel = forwardRef<ImperativePreviewHandle, Props>(({ toggleTerminal }, ref) => {
  const tutorialRunner = useContext(TutorialRunnerContext);
  const expectedPreviews = useStore(tutorialRunner.previews);

  const hasPreviews = expectedPreviews.some((preview) => preview.ready);

  useImperativeHandle(
    ref,
    () => ({
      reload: () => {
        // can't use a ref because PanelGroup does not expose the underlying html element
        const previewPanel = document.getElementById('preview-panel');

        if (previewPanel) {
          const iframes = previewPanel.querySelectorAll('iframe');

          for (const iframe of iframes) {
            iframe.src = iframe.src;
          }
        }
      },
    }),
    [],
  );

  if (!hasPreviews) {
    return (
      <div className="h-full w-full">
        <div className="panel-header border-y border-panel-border justify-between">
          <div className="panel-title">
            <div className="i-ph-lightning-duotone"></div>
            <span className="text-sm">Preparing Environment</span>
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
        <BootScreen />
      </div>
    );
  }

  const previews = expectedPreviews.filter((preview) => preview.ready);
  const defaultSize = 100 / previews.length;
  const minSize = 20;

  const children = [];

  for (const [index, preview] of previews.entries()) {
    children.push(
      <Panel defaultSize={defaultSize} minSize={minSize}>
        <Preview
          preview={preview}
          previewCount={previews.length}
          first={index === 0}
          last={index === previews.length - 1}
          toggleTerminal={toggleTerminal}
        />
      </Panel>,
    );

    if (index !== previews.length - 1) {
      children.push(<PanelResizeHandle className={resizePanelStyles.PanelResizeHandle} />);
    }
  }

  return createElement(PanelGroup, { id: 'preview-panel', direction: 'horizontal' }, children);
});

interface PreviewProps {
  preview: PreviewInfo;
  previewCount: number;
  first?: boolean;
  last?: boolean;
  toggleTerminal?: () => void;
}

function Preview({ preview, previewCount, first, last, toggleTerminal }: PreviewProps) {
  return (
    <div className={`panel-container ${!first ? 'border-l border-panel-border' : ''}`}>
      <div className="panel-header border-y border-panel-border justify-between">
        <div className="panel-title">
          <div className="i-ph-globe-duotone"></div>
          <span className="text-sm truncate">{previewTitle(preview, previewCount)}</span>
        </div>
        {last && (
          <button
            className="panel-button px-2 py-0.5 -mr-1 -my-1"
            title="Toggle Terminal"
            onClick={() => toggleTerminal?.()}
          >
            <div className="i-ph-terminal-window-duotone"></div>
            <span className="text-sm">Toggle Terminal</span>
          </button>
        )}
      </div>
      <div className="h-full w-full flex justify-center items-center">
        <iframe src={preview.url} className="h-full w-full" />
      </div>
    </div>
  );
}

function previewTitle(preview: PreviewInfo, previewCount: number) {
  if (preview.title) {
    return preview.title;
  }

  if (previewCount === 1) {
    return 'Preview';
  }

  return `Preview on port ${preview.port}`;
}
