import { BootScreen } from '../BootScreen.js';
import type { PreviewInfo, TutorialRunner } from '@tutorialkit/runtime';
import { useStore } from '@nanostores/react';
import resizePanelStyles from '../styles/resize-panel.module.css';
import { classNames } from '../utils/classnames.js';
import { createElement, forwardRef, memo, useEffect, useImperativeHandle, useRef } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

interface Props {
  toggleTerminal?: () => void;
  tutorialRunner: TutorialRunner;
}

const previewsContainer = globalThis.document ? document.getElementById('previews-container')! : ({} as HTMLElement);

type IframeRef = { ref: HTMLIFrameElement | undefined };

export type ImperativePreviewHandle = {
  reload: () => void;
};

export const PreviewPanel = memo(
  forwardRef<ImperativePreviewHandle, Props>(({ toggleTerminal, tutorialRunner }, ref) => {
    const expectedPreviews = useStore(tutorialRunner.previews);
    const iframeRefs = useRef<IframeRef[]>([]);

    const activePreviewsCount = expectedPreviews.reduce((count, preview) => (preview.ready ? count + 1 : count), 0);
    const hasPreviews = activePreviewsCount > 0;

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

    adjustSize(iframeRefs.current, activePreviewsCount, newIframeRef);
    preparePreviewsContainer(activePreviewsCount);

    // update preview refs
    for (const [index, iframeRef] of iframeRefs.current.entries()) {
      if (!iframeRef.ref) {
        iframeRef.ref = previewsContainer.children.item(index) as HTMLIFrameElement;
      }
    }

    if (!hasPreviews) {
      return (
        <div className="flex flex-col h-full w-full">
          <div className="panel-header border-y border-tk-elements-app-borderColor justify-between">
            <div className="panel-title">
              <div className="panel-icon i-ph-lightning-duotone"></div>
              <span className="text-sm">Preparing Environment</span>
            </div>
            <button
              className="panel-button px-2 py-0.5 -mr-1 -my-1"
              title="Toggle Terminal"
              onClick={() => toggleTerminal?.()}
            >
              <span className="panel-button-icon i-ph-terminal-window-duotone"></span>
              <span className="text-sm">Toggle Terminal</span>
            </button>
          </div>
          <BootScreen tutorialRunner={tutorialRunner} />
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
            iframe={iframeRefs.current[index]}
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

    return createElement(PanelGroup, { id: 'preview-panel', direction: 'horizontal' }, ...children);
  }),
);

interface PreviewProps {
  iframe: IframeRef;
  preview: PreviewInfo;
  previewCount: number;
  first?: boolean;
  last?: boolean;
  toggleTerminal?: () => void;
}

function Preview({ preview, iframe, previewCount, first, last, toggleTerminal }: PreviewProps) {
  const previewContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!iframe.ref) {
      return;
    }

    if (preview.url) {
      iframe.ref.src = preview.url;
    }
  }, [preview.url, iframe.ref]);

  useEffect(() => {
    const padding = 1;
    const resizeObserver = new ResizeObserver(() => {
      if (!iframe.ref) {
        return;
      }

      const { left, top, width, height } = previewContainerRef.current?.getBoundingClientRect()!;
      iframe.ref.style.left = `${Math.floor(left) - padding}px`;
      iframe.ref.style.top = `${Math.floor(top) - padding}px`;
      iframe.ref.style.height = `${Math.floor(height) + padding}px`;
      iframe.ref.style.width = `${Math.floor(width) + padding}px`;
    });

    resizeObserver.observe(previewContainerRef.current!);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="panel-container">
      <div
        className={classNames('panel-header border-y border-tk-elements-app-borderColor justify-between', {
          'border-l border-tk-elements-app-borderColor': !first,
        })}
      >
        <div className="panel-title">
          <div className="panel-icon i-ph-globe-duotone"></div>
          <span className="text-sm truncate">{previewTitle(preview, previewCount)}</span>
        </div>
        {last && (
          <button
            className="panel-button px-2 py-0.5 -mr-1 -my-1"
            title="Toggle Terminal"
            onClick={() => toggleTerminal?.()}
          >
            <div className="panel-button-icon i-ph-terminal-window-duotone"></div>
            <span className="text-sm">Toggle Terminal</span>
          </button>
        )}
      </div>
      <div
        ref={previewContainerRef}
        className={classNames('h-full w-full flex justify-center items-center', {
          'border-l border-tk-elements-previews-borderColor': !first,
        })}
      />
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

function preparePreviewsContainer(previewCount: number) {
  while (previewsContainer.childElementCount < previewCount) {
    const iframe = document.createElement('iframe');
    iframe.className = 'absolute -z-10';
    iframe.allow =
      'magnetometer; accelerometer; gyroscope; geolocation; microphone; camera; payment; autoplay; serial; xr-spatial-tracking; cross-origin-isolated';

    previewsContainer.appendChild(iframe);
  }

  for (let i = 0; i < previewsContainer.childElementCount; i++) {
    const preview = previewsContainer.children.item(i)!;

    if (i < previewCount) {
      preview.classList.remove('hidden');
    } else {
      preview.classList.add('hidden');
    }
  }
}

function newIframeRef(): IframeRef {
  return { ref: undefined };
}

function adjustSize<T>(array: T[], expectedSize: number, newElement: () => T) {
  while (array.length < expectedSize) {
    array.push(newElement());
  }

  while (array.length > expectedSize) {
    array.pop();
  }
}
