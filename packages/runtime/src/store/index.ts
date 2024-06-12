import type { Files, Lesson } from '@tutorialkit/types';
import type { WebContainer } from '@webcontainer/api';
import { atom, type ReadableAtom } from 'nanostores';
import { LessonFilesFetcher } from '../lesson-files.js';
import { newTask, type Task } from '../tasks.js';
import { TutorialRunner } from '../tutorial-runner.js';
import type { ITerminal } from '../utils/terminal.js';
import type { PreviewInfo } from '../webcontainer/preview-info.js';
import { StepsController } from '../webcontainer/steps.js';
import type { TerminalConfig } from '../webcontainer/terminal-config.js';
import { EditorStore, type EditorDocument, type EditorDocuments, type ScrollPosition } from './editor.js';
import { PreviewsStore } from './previews.js';
import { TerminalStore } from './terminal.js';

interface StoreOptions {
  webcontainer: Promise<WebContainer>;
  useAuth: boolean;
}

export class TutorialStore {
  private _webcontainer: Promise<WebContainer>;

  private _runner: TutorialRunner;
  private _previewsStore: PreviewsStore;
  private _editorStore: EditorStore;
  private _terminalStore: TerminalStore;

  private _stepController = new StepsController();
  private _lessonFilesFetcher = new LessonFilesFetcher();
  private _lessonTask: Task<unknown> | undefined;
  private _lesson: Lesson | undefined;
  private _ref: number = 1;

  private _lessonFiles: Files | undefined;
  private _lessonSolution: Files | undefined;
  private _lessonTemplate: Files | undefined;

  /**
   * Whether or not the current lesson is fully loaded in WebContainer
   * and in every stores.
   */
  readonly lessonFullyLoaded = atom<boolean>(false);

  constructor({ useAuth, webcontainer }: StoreOptions) {
    this._webcontainer = webcontainer;
    this._editorStore = new EditorStore();
    this._previewsStore = new PreviewsStore(this._webcontainer);
    this._terminalStore = new TerminalStore(this._webcontainer, useAuth);
    this._runner = new TutorialRunner(this._webcontainer, this._terminalStore, this._stepController);

    /**
     * By having this code under `import.meta.hot`, it gets:
     *  - ignored on server side where it shouldn't run
     *  - discarded when doing a production build
     */
    if (import.meta.hot) {
      import.meta.hot.on('tk:refresh-wc-files', async (hotFilesRefs: string[]) => {
        let shouldUpdate = false;

        for (const filesRef of hotFilesRefs) {
          const result = await this._lessonFilesFetcher.invalidate(filesRef);

          switch (result.type) {
            case 'none': {
              break;
            }
            case 'files': {
              if (this._lesson?.files[0] === filesRef) {
                shouldUpdate = true;

                this._lesson.files[1] = Object.keys(result.files).sort();
                this._lessonFiles = result.files;
              }
            }
            case 'solution': {
              if (this._lesson?.solution[0] === filesRef) {
                shouldUpdate = true;

                this._lesson.solution[1] = Object.keys(result.files).sort();
                this._lessonSolution = result.files;
              }
            }
            case 'template': {
              shouldUpdate = true;

              this._lessonTemplate = result.files;
            }
          }
        }

        if (shouldUpdate && this._lesson) {
          this._lessonTask?.cancel();

          const files = this._lessonFiles ?? {};
          const template = this._lessonTemplate;

          this._lessonTask = newTask(
            async (signal) => {
              const preparePromise = this._runner.prepareFiles({ template, files, signal });

              this._runner.runCommands();
              this._editorStore.setDocuments(files);

              await preparePromise;
            },
            { ignoreCancel: true },
          );
        }
      });
    }
  }

  setLesson(lesson: Lesson, options: { ssr?: boolean } = {}) {
    if (lesson === this._lesson) {
      return;
    }

    this._lessonTask?.cancel();

    this._ref += 1;
    this._lesson = lesson;
    this.lessonFullyLoaded.set(false);

    this._previewsStore.setPreviews(lesson.data.previews ?? true);
    this._terminalStore.setTerminalConfiguration(lesson.data.terminal);
    this._runner.setCommands(lesson.data);
    this._editorStore.setDocuments(lesson.files);

    if (options.ssr) {
      return;
    }

    this._lessonTask = newTask(
      async (signal) => {
        const templatePromise = this._lessonFilesFetcher.getLessonTemplate(lesson);
        const filesPromise = this._lessonFilesFetcher.getLessonFiles(lesson);

        const preparePromise = this._runner.prepareFiles({ template: templatePromise, files: filesPromise, signal });

        this._runner.runCommands();

        const [template, solution, files] = await Promise.all([
          templatePromise,
          this._lessonFilesFetcher.getLessonSolution(lesson),
          filesPromise,
        ]);

        signal.throwIfAborted();

        this._lessonTemplate = template;
        this._lessonFiles = files;
        this._lessonSolution = solution;

        this._editorStore.setDocuments(files);

        if (lesson.data.focus === undefined) {
          this._editorStore.setSelectedFile(undefined);
        } else if (files[lesson.data.focus] !== undefined) {
          this._editorStore.setSelectedFile(lesson.data.focus);
        }

        await preparePromise;

        signal.throwIfAborted();

        this.lessonFullyLoaded.set(true);
      },
      { ignoreCancel: true },
    );
  }

  get previews(): ReadableAtom<PreviewInfo[]> {
    return this._previewsStore.previews;
  }

  get terminalConfig(): ReadableAtom<TerminalConfig> {
    return this._terminalStore.terminalConfig;
  }

  get currentDocument(): ReadableAtom<EditorDocument | undefined> {
    return this._editorStore.currentDocument;
  }

  get documents(): ReadableAtom<EditorDocuments> {
    return this._editorStore.documents;
  }

  get selectedFile(): ReadableAtom<string | undefined> {
    return this._editorStore.selectedFile;
  }

  get lesson(): Readonly<Lesson> | undefined {
    return this._lesson;
  }

  get ref(): unknown {
    return this._ref;
  }

  /**
   * Steps that the runner is or will be executing.
   */
  get steps() {
    return this._stepController.steps;
  }

  hasFileTree(): boolean {
    if (!this._lesson) {
      return false;
    }

    const { editor } = this._lesson.data;

    return editor === undefined || editor === true || (editor !== false && editor?.fileTree !== false);
  }

  hasEditor(): boolean {
    if (!this._lesson) {
      return false;
    }

    const { editor } = this._lesson.data;

    return editor !== false;
  }

  hasPreviews(): boolean {
    if (!this._lesson) {
      return false;
    }

    const { previews } = this._lesson.data;

    return previews !== false;
  }

  hasTerminalPanel(): boolean {
    return this._terminalStore.hasTerminalPanel();
  }

  hasSolution(): boolean {
    return !!this._lesson && Object.keys(this._lesson.solution).length >= 1;
  }

  reset() {
    const isReady = this.lessonFullyLoaded.value;

    if (!isReady || !this._lessonFiles) {
      return;
    }

    this._editorStore.setDocuments(this._lessonFiles);
    this._runner.updateFiles(this._lessonFiles);
  }

  solve() {
    const isReady = this.lessonFullyLoaded.value;

    if (!isReady || !this._lessonSolution) {
      return;
    }

    this._editorStore.setDocuments(this._lessonSolution);
    this._runner.updateFiles(this._lessonSolution);
  }

  setSelectedFile(filePath: string | undefined) {
    this._editorStore.setSelectedFile(filePath);
  }

  updateFile(filePath: string, content: string) {
    const hasChanged = this._editorStore.updateFile(filePath, content);

    if (hasChanged) {
      this._runner.updateFile(filePath, content);
    }
  }

  updateFiles(files: Files) {
    this._runner.updateFiles(files);
  }

  setCurrentDocumentContent(newContent: string) {
    const filePath = this.currentDocument.get()?.filePath;

    if (!filePath) {
      return;
    }

    this.updateFile(filePath, newContent);
  }

  setCurrentDocumentScrollPosition(position: ScrollPosition) {
    const editorDocument = this.currentDocument.get();

    if (!editorDocument) {
      return;
    }

    const { filePath } = editorDocument;

    this._editorStore.updateScrollPosition(filePath, position);
  }

  attachTerminal(id: string, terminal: ITerminal) {
    this._terminalStore.attachTerminal(id, terminal);
  }

  onTerminalResize(cols: number, rows: number) {
    if (cols && rows) {
      this._terminalStore.onTerminalResize(cols, rows);
      this._runner.onTerminalResize(cols, rows);
    }
  }
}
