import * as fs from 'fs';
import grayMatter from 'gray-matter';
import * as path from 'path';
import * as vscode from 'vscode';
import { cmd } from '../commands';
import { Lesson } from '../models/Lesson';
import { getIcon } from '../utils/getIcon';

const metadataFiles = ['meta.md', 'meta.mdx', 'content.md', 'content.mdx'];

export const tutorialMimeType = 'application/tutorialkit.unit';

let lessonsTreeDataProvider: LessonsTreeDataProvider;

export function getLessonsTreeDataProvider() {
  return lessonsTreeDataProvider;
}
export function setLessonsTreeDataProvider(provider: LessonsTreeDataProvider) {
  lessonsTreeDataProvider = provider;
}

export class LessonsTreeDataProvider implements vscode.TreeDataProvider<Lesson> {
  private _lessons: Lesson[] = [];

  constructor(
    private readonly _workspaceRoot: vscode.Uri,
    private _context: vscode.ExtensionContext,
  ) {
    this._loadLessons();
  }

  private _loadLessons(): void {
    try {
      const tutorialFolderPath = vscode.Uri.joinPath(this._workspaceRoot, 'src', 'content', 'tutorial').fsPath;
      this._lessons = this._loadLessonsFromFolder(tutorialFolderPath);
    } catch {
      // do nothing
    }
  }

  private _loadLessonsFromFolder(folderPath: string): Lesson[] {
    const lessons: Lesson[] = [];
    const files = fs.readdirSync(folderPath);

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        const lessonName = path.basename(filePath);
        const subLessons = this._loadLessonsFromFolder(filePath);
        const lesson = new Lesson(lessonName, filePath, subLessons);

        // check if the folder directly includes one of the metadata files
        const folderFiles = fs.readdirSync(filePath);
        const metadataFile = folderFiles.find((folderFile) => metadataFiles.includes(folderFile));

        if (metadataFile) {
          const metadataFilePath = path.join(filePath, metadataFile);
          const metadataFileContent = fs.readFileSync(metadataFilePath, 'utf8');
          const parsedContent = grayMatter(metadataFileContent);
          lesson.name = parsedContent.data.title;
          lesson.metadata = {
            _path: metadataFilePath,
            ...(parsedContent.data as any),
          };
          lessons.push(lesson);
        }
      }
    }

    return lessons;
  }

  private _onDidChangeTreeData: vscode.EventEmitter<Lesson | undefined> = new vscode.EventEmitter<Lesson | undefined>();
  readonly onDidChangeTreeData: vscode.Event<Lesson | undefined> = this._onDidChangeTreeData.event;

  refresh(): void {
    this._loadLessons();
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(lesson: Lesson): vscode.TreeItem {
    const treeItem = new vscode.TreeItem(lesson.name);

    treeItem.collapsibleState =
      lesson.children.length > 0 ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None;

    treeItem.contextValue = lesson.metadata?.type;

    treeItem.command = {
      command: cmd.goto.command,
      title: 'Go to the lesson',
      arguments: [lesson.metadata?._path],
    };

    treeItem.iconPath =
      lesson.metadata?.type === 'lesson' ? getIcon(this._context, 'lesson.svg') : getIcon(this._context, 'chapter.svg');

    return treeItem;
  }

  getChildren(element?: Lesson): Lesson[] {
    if (element) {
      return element.children;
    }

    return this._lessons;
  }
}

export async function useLessonTree() {
  /**
   * `
   * vscode.workspace.onDidChangeWorkspaceFolders((event) => {
   *   event.added.forEach((folder) => {
   *     if (isTutorialKitWorkspace(folder)) {
   *     }
   *   });
   * });
   */

  // vscode.commands.executeCommand('setContext', 'tutorialkit:tree', true);

  cmd.initialize();

  /**
   * `
   * const tutorialWorkpaces = (vscode.workspace.workspaceFolders || []).filter(
   *   isTutorialKitWorkspace,
   * );
   * const selectedWorkspace =
   *   tutorialWorkpaces.length === 1
   *     ? tutorialWorkpaces[0]
   *     : await vscode.window
   *         .showQuickPick(
   *           tutorialWorkpaces.map((workspace) => workspace.name),
   *           {
   *             placeHolder: 'Select a workspace',
   *           },
   *         )
   *         .then((selected) =>
   *           tutorialWorkpaces.find((workspace) => workspace.name === selected),
   *         );
   */

  /**
   * `
   * if (selectedWorkspace) {
   *   setLessonsTreeDataProvider(
   *     new LessonsTreeDataProvider(selectedWorkspace.uri, context),
   *   );
   *   context.subscriptions.push(
   *     vscode.window.createTreeView('tutorialkit-lessons-tree', {
   *       treeDataProvider: getLessonsTreeDataProvider(),
   *       canSelectMany: true,
   *     }),
   *   );
   * }
   */
}
