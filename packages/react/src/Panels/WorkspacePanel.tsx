import { useStore } from '@nanostores/react';
import type { TutorialStore } from '@tutorialkit/runtime';
import type { I18n } from '@tutorialkit/types';
import { useCallback, useEffect, useRef, useState, type ComponentProps } from 'react';
import { Panel, PanelGroup, PanelResizeHandle, type ImperativePanelHandle } from 'react-resizable-panels';
import { DialogProvider } from '../core/Dialog.js';
import type { Theme } from '../core/types.js';
import resizePanelStyles from '../styles/resize-panel.module.css';
import { classNames } from '../utils/classnames.js';
import { EditorPanel } from './EditorPanel.js';
import { PreviewPanel, type ImperativePreviewHandle } from './PreviewPanel.js';
import { TerminalPanel } from './TerminalPanel.js';

const DEFAULT_TERMINAL_SIZE = 25;

type FileTreeChangeEvent = Parameters<NonNullable<ComponentProps<typeof EditorPanel>['onFileTreeChange']>>[0];

interface Props {
  tutorialStore: TutorialStore;
  theme: Theme;
  dialog: NonNullable<ComponentProps<typeof DialogProvider>['value']>;
}

interface PanelProps extends Omit<Props, 'dialog'> {
  hasEditor: boolean;
  hasPreviews: boolean;
  hideTerminalPanel: boolean;
}

interface TerminalProps extends PanelProps {
  terminalPanelRef: React.RefObject<ImperativePanelHandle>;
  terminalExpanded: React.MutableRefObject<boolean>;
}

/**
 * This component is the orchestrator between various interactive components.
 */
export function WorkspacePanel({ tutorialStore, theme, dialog }: Props) {
  /**
   * Re-render when lesson changes.
   * The `tutorialStore.hasEditor()` and other methods below access
   * stale data as they are not reactive.
   */
  useStore(tutorialStore.ref);

  const hasEditor = tutorialStore.hasEditor();
  const hasPreviews = tutorialStore.hasPreviews();
  const hideTerminalPanel = !tutorialStore.hasTerminalPanel();

  const terminalPanelRef = useRef<ImperativePanelHandle>(null);
  const terminalExpanded = useRef(false);

  return (
    <PanelGroup className={resizePanelStyles.PanelGroup} id="right-panel-group" direction="vertical">
      <DialogProvider value={dialog}>
        <EditorSection
          theme={theme}
          tutorialStore={tutorialStore}
          hasEditor={hasEditor}
          hasPreviews={hasPreviews}
          hideTerminalPanel={hideTerminalPanel}
        />
      </DialogProvider>

      <PanelResizeHandle
        className={resizePanelStyles.PanelResizeHandle}
        hitAreaMargins={{ fine: 5, coarse: 5 }}
        disabled={!hasEditor}
      />

      <PreviewsSection
        theme={theme}
        tutorialStore={tutorialStore}
        terminalPanelRef={terminalPanelRef}
        terminalExpanded={terminalExpanded}
        hideTerminalPanel={hideTerminalPanel}
        hasPreviews={hasPreviews}
        hasEditor={hasEditor}
      />

      <PanelResizeHandle
        className={resizePanelStyles.PanelResizeHandle}
        hitAreaMargins={{ fine: 5, coarse: 5 }}
        disabled={hideTerminalPanel || !hasPreviews}
      />

      <TerminalSection
        tutorialStore={tutorialStore}
        theme={theme}
        terminalPanelRef={terminalPanelRef}
        terminalExpanded={terminalExpanded}
        hideTerminalPanel={hideTerminalPanel}
        hasEditor={hasEditor}
        hasPreviews={hasPreviews}
      />
    </PanelGroup>
  );
}

function EditorSection({ theme, tutorialStore, hasEditor }: PanelProps) {
  const [helpAction, setHelpAction] = useState<'solve' | 'reset'>('reset');
  const selectedFile = useStore(tutorialStore.selectedFile);
  const currentDocument = useStore(tutorialStore.currentDocument);
  const lessonFullyLoaded = useStore(tutorialStore.lessonFullyLoaded);
  const editorConfig = useStore(tutorialStore.editorConfig);
  const storeRef = useStore(tutorialStore.ref);
  const files = useStore(tutorialStore.files);

  const lesson = tutorialStore.lesson!;

  function onHelpClick() {
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
  }

  async function onFileTreeChange({ method, type, value }: FileTreeChangeEvent) {
    if (method === 'add' && type === 'file') {
      return tutorialStore.addFile(value);
    }

    if (method === 'add' && type === 'folder') {
      return tutorialStore.addFolder(value);
    }
  }

  useEffect(() => {
    if (tutorialStore.hasSolution()) {
      setHelpAction('solve');
    } else {
      setHelpAction('reset');
    }
  }, [storeRef]);

  return (
    <Panel
      id={hasEditor ? 'editor-opened' : 'editor-closed'}
      defaultSize={hasEditor ? 50 : 0}
      minSize={10}
      maxSize={hasEditor ? 100 : 0}
      collapsible={!hasEditor}
      className="transition-theme bg-tk-elements-panel-backgroundColor text-tk-elements-panel-textColor"
    >
      <EditorPanel
        id={storeRef}
        theme={theme}
        showFileTree={tutorialStore.hasFileTree()}
        editorDocument={currentDocument}
        files={files}
        i18n={lesson.data.i18n as I18n}
        hideRoot={lesson.data.hideRoot}
        helpAction={helpAction}
        onHelpClick={lessonFullyLoaded ? onHelpClick : undefined}
        onFileSelect={(filePath) => tutorialStore.setSelectedFile(filePath)}
        onFileTreeChange={onFileTreeChange}
        allowEditPatterns={editorConfig.fileTree.allowEdits || undefined}
        selectedFile={selectedFile}
        onEditorScroll={(position) => tutorialStore.setCurrentDocumentScrollPosition(position)}
        onEditorChange={(update) => tutorialStore.setCurrentDocumentContent(update.content)}
      />
    </Panel>
  );
}

function PreviewsSection({
  tutorialStore,
  terminalPanelRef,
  terminalExpanded,
  hideTerminalPanel,
  hasPreviews,
  hasEditor,
}: TerminalProps) {
  const previewRef = useRef<ImperativePreviewHandle>(null);
  const lesson = tutorialStore.lesson!;
  const terminalConfig = useStore(tutorialStore.terminalConfig);
  const storeRef = useStore(tutorialStore.ref);

  function showTerminal() {
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
  }

  const toggleTerminal = useCallback(() => {
    if (terminalPanelRef.current?.isCollapsed()) {
      showTerminal();
    } else if (terminalPanelRef.current) {
      terminalPanelRef.current.collapse();
    }
  }, []);

  useEffect(() => {
    if (hideTerminalPanel) {
      // force hide the terminal if we don't have any panels to show
      terminalPanelRef.current?.collapse();

      terminalExpanded.current = false;
    }
  }, [hideTerminalPanel]);

  useEffect(() => {
    if (terminalConfig.defaultOpen) {
      showTerminal();
    }
  }, [terminalConfig.defaultOpen]);

  useEffect(() => {
    const lesson = tutorialStore.lesson!;

    const unsubscribe = tutorialStore.lessonFullyLoaded.subscribe((loaded) => {
      if (loaded && lesson.data.autoReload) {
        previewRef.current?.reload();
      }
    });

    return () => unsubscribe();
  }, [storeRef]);

  const MIN_SIZE_IN_PIXELS = 38;
  const [panelMinSize, setPanelMinSize] = useState(10);

  useEffect(() => {
    const panelGroup = document.querySelector('div[data-panel-group-id="right-panel-group"]' as 'div');

    if (!panelGroup) {
      return;
    }

    const observer = new ResizeObserver(() => {
      const height = panelGroup?.offsetHeight;
      setPanelMinSize((MIN_SIZE_IN_PIXELS / height) * 100);
    });
    observer.observe(panelGroup);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <Panel
      id={hasPreviews ? 'previews-opened' : 'previews-closed'}
      defaultSize={hasPreviews ? 50 : 0}
      minSize={panelMinSize}
      maxSize={hasPreviews ? 100 : 0}
      collapsible={!hasPreviews}
      className={classNames({
        'transition-theme border-t border-tk-elements-app-borderColor': hasEditor,
      })}
    >
      <PreviewPanel
        ref={previewRef}
        tutorialStore={tutorialStore}
        i18n={lesson.data.i18n as I18n}
        showToggleTerminal={!hideTerminalPanel}
        toggleTerminal={toggleTerminal}
      />
    </Panel>
  );
}

function TerminalSection({
  tutorialStore,
  theme,
  terminalPanelRef,
  terminalExpanded,
  hideTerminalPanel,
  hasEditor,
  hasPreviews,
}: TerminalProps) {
  let id = 'terminal-closed';

  if (hideTerminalPanel) {
    id = 'terminal-none';
  } else if (!hasPreviews && !hasEditor) {
    id = 'terminal-full';
  } else if (!hasPreviews) {
    id = 'terminal-opened';
  }

  let defaultSize = 0;

  if (hideTerminalPanel) {
    defaultSize = 0;
  } else if (!hasPreviews && !hasEditor) {
    defaultSize = 100;
  } else if (!hasPreviews) {
    defaultSize = DEFAULT_TERMINAL_SIZE;
  }

  return (
    <Panel
      id={id}
      defaultSize={defaultSize}
      minSize={hideTerminalPanel ? 0 : 10}
      collapsible={hasPreviews}
      ref={terminalPanelRef}
      onExpand={() => {
        terminalExpanded.current = true;
      }}
      className={classNames('transition-theme bg-tk-elements-panel-backgroundColor text-tk-elements-panel-textColor', {
        'border-t border-tk-elements-app-borderColor': hasPreviews,
      })}
    >
      <TerminalPanel tutorialStore={tutorialStore} theme={theme} />
    </Panel>
  );
}
