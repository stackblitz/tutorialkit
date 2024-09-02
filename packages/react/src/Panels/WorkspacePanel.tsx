import { useStore } from '@nanostores/react';
import { TutorialStore } from '@tutorialkit/runtime';
import type { I18n } from '@tutorialkit/types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle, type ImperativePanelHandle } from 'react-resizable-panels';
import type {
  OnChangeCallback as OnEditorChange,
  OnScrollCallback as OnEditorScroll,
} from '../core/CodeMirrorEditor/index.js';
import type { Theme } from '../core/types.js';
import resizePanelStyles from '../styles/resize-panel.module.css';
import { classNames } from '../utils/classnames.js';
import { EditorPanel } from './EditorPanel.js';
import { PreviewPanel, type ImperativePreviewHandle } from './PreviewPanel.js';
import { TerminalPanel } from './TerminalPanel.js';

const DEFAULT_TERMINAL_SIZE = 25;

interface Props {
  tutorialStore: TutorialStore;
  theme: Theme;
}

/**
 * This component is the orchestrator between various interactive components.
 */
export function WorkspacePanel({ tutorialStore, theme }: Props) {
  const fileTree = tutorialStore.hasFileTree();
  const hasEditor = tutorialStore.hasEditor();
  const hasPreviews = tutorialStore.hasPreviews();
  const hideTerminalPanel = !tutorialStore.hasTerminalPanel();

  const editorPanelRef = useRef<ImperativePanelHandle>(null);
  const previewPanelRef = useRef<ImperativePanelHandle>(null);
  const terminalPanelRef = useRef<ImperativePanelHandle>(null);
  const previewRef = useRef<ImperativePreviewHandle>(null);
  const terminalExpanded = useRef(false);

  const [helpAction, setHelpAction] = useState<'solve' | 'reset'>('reset');

  const selectedFile = useStore(tutorialStore.selectedFile);
  const currentDocument = useStore(tutorialStore.currentDocument);
  const lessonFullyLoaded = useStore(tutorialStore.lessonFullyLoaded);

  const lesson = tutorialStore.lesson!;

  const onEditorChange = useCallback<OnEditorChange>((update) => {
    tutorialStore.setCurrentDocumentContent(update.content);
  }, []);

  const onEditorScroll = useCallback<OnEditorScroll>((position) => {
    tutorialStore.setCurrentDocumentScrollPosition(position);
  }, []);

  const onFileSelect = useCallback((filePath: string | undefined) => {
    tutorialStore.setSelectedFile(filePath);
  }, []);

  const onHelpClick = useCallback(() => {
    if (tutorialStore.hasSolution()) {
      setHelpAction((action) => {
        if (action === 'reset') {
          tutorialStore.reset();

          return 'solve';
        } else {
          tutorialStore.solve();

          return 'reset';
        }
      });
    } else {
      tutorialStore.reset();
    }
  }, [tutorialStore.ref]);

  useEffect(() => {
    const lesson = tutorialStore.lesson!;

    const unsubscribe = tutorialStore.lessonFullyLoaded.subscribe((loaded) => {
      if (loaded && lesson.data.autoReload) {
        previewRef.current?.reload();
      }
    });

    if (tutorialStore.hasSolution()) {
      setHelpAction('solve');
    } else {
      setHelpAction('reset');
    }

    if (tutorialStore.terminalConfig.value?.defaultOpen) {
      showTerminal();
    }

    return () => unsubscribe();
  }, [tutorialStore.ref]);

  useEffect(() => {
    if (hideTerminalPanel) {
      // force hide the terminal if we don't have any panels to show
      hideTerminal();

      terminalExpanded.current = false;
    }
  }, [hideTerminalPanel]);

  const showTerminal = useCallback(() => {
    const { current: terminal } = terminalPanelRef;

    if (!terminal) {
      return;
    }

    if (!terminalExpanded.current) {
      terminalExpanded.current = true;
      terminal.resize(DEFAULT_TERMINAL_SIZE);
    } else {
      terminal.expand();
    }
  }, []);

  const hideTerminal = useCallback(() => {
    terminalPanelRef.current?.collapse();
  }, []);

  const toggleTerminal = useCallback(() => {
    const { current: terminal } = terminalPanelRef;

    if (!terminal) {
      return;
    }

    if (terminalPanelRef.current?.isCollapsed()) {
      showTerminal();
    } else {
      hideTerminal();
    }
  }, []);

  return (
    <PanelGroup className={resizePanelStyles.PanelGroup} direction="vertical">
      <Panel
        id={hasEditor ? 'editor-opened' : 'editor-closed'}
        defaultSize={hasEditor ? 50 : 0}
        minSize={10}
        maxSize={hasEditor ? 100 : 0}
        collapsible={!hasEditor}
        ref={editorPanelRef}
        className="transition-theme bg-tk-elements-panel-backgroundColor text-tk-elements-panel-textColor"
      >
        <EditorPanel
          id={tutorialStore.ref}
          theme={theme}
          showFileTree={fileTree}
          editorDocument={currentDocument}
          files={lesson.files[1]}
          i18n={lesson.data.i18n as I18n}
          hideRoot={lesson.data.hideRoot}
          helpAction={helpAction}
          onHelpClick={lessonFullyLoaded ? onHelpClick : undefined}
          onFileSelect={onFileSelect}
          selectedFile={selectedFile}
          onEditorScroll={onEditorScroll}
          onEditorChange={onEditorChange}
        />
      </Panel>
      <PanelResizeHandle
        className={resizePanelStyles.PanelResizeHandle}
        hitAreaMargins={{ fine: 5, coarse: 5 }}
        disabled={!hasEditor}
      />
      <Panel
        id={hasPreviews ? 'previews-opened' : 'previews-closed'}
        defaultSize={hasPreviews ? 50 : 0}
        minSize={10}
        maxSize={hasPreviews ? 100 : 0}
        collapsible={!hasPreviews}
        ref={previewPanelRef}
        className={classNames({
          'transition-theme border-t border-tk-elements-app-borderColor': hasEditor,
        })}
      >
        <PreviewPanel
          tutorialStore={tutorialStore}
          i18n={lesson.data.i18n as I18n}
          ref={previewRef}
          showToggleTerminal={!hideTerminalPanel}
          toggleTerminal={toggleTerminal}
        />
      </Panel>
      <PanelResizeHandle
        className={resizePanelStyles.PanelResizeHandle}
        hitAreaMargins={{ fine: 5, coarse: 5 }}
        disabled={hideTerminalPanel || !hasPreviews}
      />
      <Panel
        id={
          hideTerminalPanel
            ? 'terminal-none'
            : !hasPreviews && !hasEditor
              ? 'terminal-full'
              : !hasPreviews
                ? 'terminal-opened'
                : 'terminal-closed'
        }
        defaultSize={
          hideTerminalPanel ? 0 : !hasPreviews && !hasEditor ? 100 : !hasPreviews ? DEFAULT_TERMINAL_SIZE : 0
        }
        minSize={hideTerminalPanel ? 0 : 10}
        collapsible={hasPreviews}
        ref={terminalPanelRef}
        onExpand={() => {
          terminalExpanded.current = true;
        }}
        className={classNames(
          'transition-theme bg-tk-elements-panel-backgroundColor text-tk-elements-panel-textColor',
          {
            'border-t border-tk-elements-app-borderColor': hasPreviews,
          },
        )}
      >
        <TerminalPanel tutorialStore={tutorialStore} theme={theme} />
      </Panel>
    </PanelGroup>
  );
}
