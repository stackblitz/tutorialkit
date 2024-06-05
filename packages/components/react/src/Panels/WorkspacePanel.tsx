import { TutorialRunner, lessonFilesFetcher } from '@tutorialkit/runtime';
import { newTask } from '@tutorialkit/runtime/tasks';
import type { Files, Lesson } from '@tutorialkit/types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '@nanostores/react';
import { Panel, PanelGroup, PanelResizeHandle, type ImperativePanelHandle } from 'react-resizable-panels';
import type {
  EditorDocument,
  OnChangeCallback as OnEditorChange,
  OnScrollCallback as OnEditorScroll,
} from '../CodeMirrorEditor/index.js';
import resizePanelStyles from '../styles/resize-panel.module.css';
import type { Theme } from '../types';
import { EditorPanel } from './EditorPanel.js';
import { PreviewPanel, type ImperativePreviewHandle } from './PreviewPanel.js';
import { TerminalPanel } from './TerminalPanel.js';
import { classNames } from '../utils/classnames.js';

const DEFAULT_TERMINAL_SIZE = 25;

interface Props {
  lesson: Lesson;
  tutorialRunner: TutorialRunner;
  theme: Theme;
}

interface LoadedFiles {
  solution?: Files;
  files?: Files;
  template?: Files;
}

type EditorState = Record<string, EditorDocument>;

/**
 * This component is the orchestrator between various interactive components.
 */
export function WorkspacePanel({ lesson, tutorialRunner, theme }: Props) {
  const { editor, previews, terminal } = lesson.data;

  const fileTree = editor === undefined || editor === true || (editor !== false && editor?.fileTree !== false);
  const hasTerminal = typeof terminal !== 'object' || !Array.isArray(terminal.panels) || terminal.panels.length > 0;

  console.log(hasTerminal);

  const terminalConfig = useStore(tutorialRunner.terminalConfig);

  const editorPanelRef = useRef<ImperativePanelHandle>(null);
  const previewPanelRef = useRef<ImperativePanelHandle>(null);
  const terminalPanelRef = useRef<ImperativePanelHandle>(null);
  const previewRef = useRef<ImperativePreviewHandle>(null);
  const terminalExpanded = useRef(false);

  const [loadedFiles, setLoadedFiles] = useState<LoadedFiles>({});
  const [helpAction, setHelpAction] = useState<'solve' | 'reset'>('reset');
  const [editorState, setEditorState] = useState<EditorState>({});
  const [selectedFile, setSelectedFile] = useState<string | undefined>();

  const editorDocument = useMemo(() => {
    if (!selectedFile) {
      return undefined;
    }

    return editorState[selectedFile];
  }, [editorState, selectedFile]);

  const onEditorChange = useCallback<OnEditorChange>(
    (update) => {
      if (!editorDocument) {
        return;
      }

      const { filePath } = editorDocument;
      const documentState = editorState[filePath];

      if (!documentState) {
        return;
      }

      const currentContent = documentState.value;
      const newContent = update.content;
      const contentChanged = currentContent !== newContent;

      documentState.value = newContent;

      if (contentChanged) {
        tutorialRunner.updateFile(filePath, documentState.value);
      }
    },
    [editorDocument, editorState],
  );

  const onEditorScroll = useCallback<OnEditorScroll>(
    (position) => {
      if (!editorDocument) {
        return;
      }

      const { filePath } = editorDocument;

      const documentState = editorState[filePath];

      if (!documentState) {
        return;
      }

      documentState.scroll = position;
    },
    [editorDocument, editorState],
  );

  const onHelpClick = useCallback(() => {
    const setFiles = (files: Files) => {
      setEditorState((editorState) => {
        const newEditorState = { ...editorState };

        for (const filePath in files) {
          newEditorState[filePath] = {
            ...newEditorState[filePath],
            value: files[filePath],
          };
        }

        return newEditorState;
      });

      tutorialRunner.updateFiles(files);
    };

    if (hasSolution(lesson)) {
      setHelpAction((action) => {
        if (action === 'reset') {
          setLoadedFiles((loadedFiles) => {
            setFiles(loadedFiles.files ?? {});

            return loadedFiles;
          });

          return 'solve';
        } else {
          setLoadedFiles((loadedFiles) => {
            setFiles(loadedFiles.solution ?? {});

            return loadedFiles;
          });

          return 'reset';
        }
      });
    } else {
      setLoadedFiles((loadedFiles) => {
        setFiles(loadedFiles.files ?? {});

        return loadedFiles;
      });
    }
  }, [lesson]);

  useEffect(() => {
    setEditorState(
      Object.fromEntries(
        lesson.files[1].map((filePath) => {
          return [
            filePath,
            {
              value: '',
              loading: true,
              filePath,
            },
          ];
        }),
      ),
    );

    tutorialRunner.setPreviews(lesson.data.previews);
    tutorialRunner.setTerminalConfiguration(lesson.data.terminal);

    const task = newTask(
      async (signal) => {
        const templatePromise = lessonFilesFetcher.getLessonTemplate(lesson);
        const filesPromise = lessonFilesFetcher.getLessonFiles(lesson);

        const preparePromise = tutorialRunner.prepareFiles({ template: templatePromise, files: filesPromise, signal });

        tutorialRunner.runCommands(lesson.data);

        const [template, solution, files] = await Promise.all([
          templatePromise,
          lessonFilesFetcher.getLessonSolution(lesson),
          filesPromise,
        ]);

        signal.throwIfAborted();

        setLoadedFiles({
          template,
          solution,
          files,
        });

        setEditorState((previousState) => {
          return Object.fromEntries(
            Object.entries(files).map(([filePath, value]) => {
              return [
                filePath,
                {
                  value,
                  loading: false,
                  filePath,
                  scroll: previousState[filePath]?.scroll,
                },
              ];
            }),
          ) satisfies EditorState;
        });

        if (lesson.data.focus === undefined) {
          setSelectedFile(undefined);
        } else if (files[lesson.data.focus] !== undefined) {
          setSelectedFile(lesson.data.focus);
        }

        await preparePromise;

        signal.throwIfAborted();

        if (lesson.data.autoReload) {
          /**
           * @todo This causes some race with the preview where the iframe can show the "wrong" page.
           * I think the reason is that when the ports are different then we render new frames which
           * races against the reload which will internally reset the `src` attribute.
           */
          // previewRef.current?.reload();
        }
      },
      { ignoreCancel: true },
    );

    if (hasSolution(lesson)) {
      setHelpAction('solve');
    } else {
      setHelpAction('reset');
    }

    return () => task.cancel();
  }, [lesson]);

  useEffect(() => {
    if (terminalConfig.panels.length === 0) {
      // force hide the terminal if we don't have any panels to show
      hideTerminal();

      terminalExpanded.current = false;
    }
  }, [terminalConfig]);

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
        id={editor === false ? 'editor-closed' : 'editor-opened'}
        defaultSize={editor === false ? 0 : 50}
        minSize={10}
        maxSize={editor === false ? 0 : 100}
        collapsible={editor === false}
        ref={editorPanelRef}
      >
        <EditorPanel
          theme={theme}
          showFileTree={fileTree}
          editorDocument={editorDocument}
          lesson={lesson}
          helpAction={helpAction}
          onHelpClick={onHelpClick}
          onFileClick={setSelectedFile}
          onEditorScroll={onEditorScroll}
          onEditorChange={onEditorChange}
        />
      </Panel>
      <PanelResizeHandle
        className={resizePanelStyles.PanelResizeHandle}
        hitAreaMargins={{ fine: 5, coarse: 5 }}
        disabled={editor === false}
      />
      <Panel
        id={previews === false ? 'previews-closed' : 'previews-opened'}
        defaultSize={previews === false ? 0 : 50}
        minSize={10}
        maxSize={previews === false ? 0 : 100}
        collapsible={previews === false}
        ref={previewPanelRef}
        className={classNames({
          'border-t border-tk-elements-app-borderColor': editor !== false
        })}>
        <PreviewPanel
          tutorialRunner={tutorialRunner}
          ref={previewRef}
          showToggleTerminal={terminalConfig.panels.length > 0}
          toggleTerminal={toggleTerminal} />
      </Panel>
      <PanelResizeHandle
        className={resizePanelStyles.PanelResizeHandle}
        hitAreaMargins={{ fine: 5, coarse: 5 }}
        disabled={terminalConfig.panels.length === 0 || previews === false}
      />
      <Panel
        id={!hasTerminal ? 'terminal-none' : previews === false && editor === false ? 'terminal-full' : previews === false ? 'terminal-opened' : 'terminal-closed'}
        defaultSize={!hasTerminal ? 0 : previews === false && editor === false ? 100 : previews === false ? DEFAULT_TERMINAL_SIZE : 0}
        minSize={hasTerminal ? 10 : 0}
        collapsible={previews !== false}
        ref={terminalPanelRef}
        onExpand={() => {
          terminalExpanded.current = true;
        }}
        className={classNames({
          'border-t border-tk-elements-app-borderColor': editor !== false && previews !== false
        })}
      >
        <TerminalPanel tutorialRunner={tutorialRunner} theme={theme} />
      </Panel>
    </PanelGroup>
  );
}

function hasSolution(lesson: Lesson): boolean {
  return Object.keys(lesson.solution).length >= 1;
}
