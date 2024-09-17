import type { FileDescriptor, Files, Lesson } from '@tutorialkit/types';
import type { WebContainer } from '@webcontainer/api';
import { atom, type ReadableAtom } from 'nanostores';
import { LessonFilesFetcher } from '../lesson-files.js';
import { newTask, type Task } from '../tasks.js';
import { TutorialRunner } from './tutorial-runner.js';
import type { ITerminal } from '../utils/terminal.js';
import type { EditorConfig } from '../webcontainer/editor-config.js';
import { bootStatus, unblockBoot, type BootStatus } from '../webcontainer/on-demand-boot.js';
import type { PreviewInfo } from '../webcontainer/preview-info.js';
import { StepsController } from '../webcontainer/steps.js';
import type { TerminalConfig } from '../webcontainer/terminal-config.js';
import { EditorStore, type EditorDocument, type EditorDocuments, type ScrollPosition } from './editor.js';
import { PreviewsStore } from './previews.js';
import { TerminalStore } from './terminal.js';

interface StoreOptions {
  webcontainer: Promise<WebContainer>;

  /**
   * Whether or not authentication is used for the WebContainer API.
   */
  useAuth: boolean;

  /**
   * The base path to use when fetching files.
   */
  basePathname?: string;
}

export class TutorialStore {
  private _webcontainer: Promise<WebContainer>;

  private _runner: TutorialRunner;
  private _previewsStore: PreviewsStore;
  private _editorStore: EditorStore;
  private _terminalStore: TerminalStore;

  private _stepController = new StepsController();
  private _lessonFilesFetcher: LessonFilesFetcher;
  private _lessonTask: Task<unknown> | undefined;
  private _lesson: Lesson | undefined;
  private _ref = atom(1);
  private _themeRef = atom(1);

  private _lessonFiles: Files | undefined;
  private _lessonSolution: Files | undefined;
  private _lessonTemplate: Files | undefined;

  /**
   * Whether or not the current lesson is fully loaded in WebContainer
   * and in every stores.
   */
  readonly lessonFullyLoaded = atom<boolean>(false);

  constructor({ useAuth, webcontainer, basePathname }: StoreOptions) {
    this._webcontainer = webcontainer;
    this._editorStore = new EditorStore();
    this._lessonFilesFetcher = new LessonFilesFetcher(basePathname);
    this._previewsStore = new PreviewsStore(this._webcontainer);
    this._terminalStore = new TerminalStore(this._webcontainer, useAuth);
    this._runner = new TutorialRunner(this._webcontainer, this._terminalStore, this._editorStore, this._stepController);

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

              break;
            }
            case 'solution': {
              if (this._lesson?.solution[0] === filesRef) {
                shouldUpdate = true;

                this._lesson.solution[1] = Object.keys(result.files).sort();
                this._lessonSolution = result.files;
              }

              break;
            }
            case 'template': {
              shouldUpdate = true;

              this._lessonTemplate = result.files;

              break;
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

    this._ref.set(1 + (this._ref.value || 0));
    this._lesson = lesson;
    this.lessonFullyLoaded.set(false);

    this._previewsStore.setPreviews(lesson.data.previews ?? true);
    this._terminalStore.setTerminalConfiguration(lesson.data.terminal);
    this._editorStore.setEditorConfig(lesson.data.editor);
    this._runner.setCommands(lesson.data);
    this._editorStore.setDocuments(lesson.files);

    if (options.ssr) {
      return;
    }

    this._runner.setSyncChangesFromWebContainer(lesson.data.filesystem?.syncChanges ?? false);

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

  get editorConfig(): ReadableAtom<EditorConfig> {
    return this._editorStore.editorConfig;
  }

  get currentDocument(): ReadableAtom<EditorDocument | undefined> {
    return this._editorStore.currentDocument;
  }

  get bootStatus(): ReadableAtom<BootStatus> {
    return bootStatus;
  }

  get documents(): ReadableAtom<EditorDocuments> {
    return this._editorStore.documents;
  }

  get files(): ReadableAtom<FileDescriptor[]> {
    return this._editorStore.files;
  }

  get template(): Files | undefined {
    return this._lessonTemplate;
  }

  get selectedFile(): ReadableAtom<string | undefined> {
    return this._editorStore.selectedFile;
  }

  get lesson(): Readonly<Lesson> | undefined {
    return this._lesson;
  }

  get ref(): ReadableAtom<unknown> {
    return this._ref;
  }

  get themeRef(): ReadableAtom<unknown> {
    return this._themeRef;
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

    return this.editorConfig.get().fileTree.visible;
  }

  hasEditor(): boolean {
    if (!this._lesson) {
      return false;
    }

    return this.editorConfig.get().visible;
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
    return !!this._lesson && Object.keys(this._lesson.solution[1]).length >= 1;
  }

  unblockBoot() {
    unblockBoot();
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

    const files = { ...this._lessonFiles, ...this._lessonSolution };

    this._editorStore.setDocuments(files);
    this._runner.updateFiles(files);
  }

  setSelectedFile(filePath: string | undefined) {
    this._editorStore.setSelectedFile(filePath);
  }

  addFile(filePath: string) {
    // always select the existing or newly created file
    this.setSelectedFile(filePath);

    // prevent creating duplicates
    if (this._editorStore.files.get().find((file) => file.path === filePath)) {
      return;
    }

    this._editorStore.addFileOrFolder({ path: filePath, type: 'file' });
    this._runner.updateFile(filePath, '');
  }

  addFolder(folderPath: string) {
    // prevent creating duplicates
    if (this._editorStore.files.get().some((file) => file.path.startsWith(folderPath))) {
      return;
    }

    this._editorStore.addFileOrFolder({ path: folderPath, type: 'folder' });
    this._runner.createFolder(folderPath);
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

  onDocumentChanged(filePath: string, callback: (document: Readonly<EditorDocument>) => void) {
    return this._editorStore.onDocumentChanged(filePath, callback);
  }

  refreshStyles() {
    this._themeRef.set(this._themeRef.get() + 1);
  }

  takeSnapshot() {
    return this._runner.takeSnapshot();
  }
}
