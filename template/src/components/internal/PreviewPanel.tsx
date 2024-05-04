import { BootScreen } from '@components/BootScreen';
import type { PreviewInfo } from '@components/webcontainer/preview-info';
import { useStore } from '@nanostores/react';
import resizePanelStyles from '@styles/resize-panel.module.css';
import { Fragment, forwardRef, useContext, useImperativeHandle, useRef } from 'react';
import { Panel, PanelGroup, PanelResizeHandle, type ImperativePanelGroupHandle } from 'react-resizable-panels';
import { TutorialRunnerContext, type Step } from '../webcontainer/tutorial-runner';

interface Props {
  toggleTerminal?: () => void;
}

export type ImperativePreviewHandle = {
  reload: () => void;
};

export const PreviewPanel = forwardRef<ImperativePreviewHandle, Props>(({ toggleTerminal }, ref) => {
  const tutorialRunner = useContext(TutorialRunnerContext);
  const expectedPreviews = useStore(tutorialRunner.previews);

  const hasPreviews = expectedPreviews.some((p) => p.ready);

  useImperativeHandle(
    ref,
    () => ({
      reload: () => {
        // can't use a ref because PanelGroup does not expose the underlying html element :(
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
            <span className="text-sm">Preparing environment</span>
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

  const previews = expectedPreviews.filter((p) => p.ready);
  const defaultSize = 100 / previews.length;
  const minSize = 20;

  return (
    <PanelGroup id={'preview-panel'} direction="horizontal">
      {previews.map((preview, index) => (
        <Fragment key={preview.port}>
          <Panel collapsible defaultSize={defaultSize} minSize={minSize}>
            <div className={`panel-container ${index > 0 ? 'border-l border-panel-border' : ''}`}>
              <div className="panel-header border-y border-panel-border justify-between">
                <div className="panel-title">
                  <div className="i-ph-globe-duotone"></div>
                  <span className="text-sm truncate">{previewTitle(preview, previews.length)}</span>
                </div>
                {index === previews.length - 1 && (
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
          </Panel>
          {index !== previews.length - 1 && (
            <PanelResizeHandle
              className={resizePanelStyles.PanelResizeHandle}
              hitAreaMargins={{ fine: 8, coarse: 8 }}
            />
          )}
        </Fragment>
      ))}
    </PanelGroup>
  );
});

function previewTitle(preview: PreviewInfo, previewCount: number) {
  if (preview.title) {
    return preview.title;
  }

  if (previewCount === 1) {
    return 'Preview';
  }

  return `Preview on port ${preview.port}`;
}
