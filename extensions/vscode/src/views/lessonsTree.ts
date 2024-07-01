import * as fs from 'fs';
import grayMatter from 'gray-matter';
import * as path from 'path';
import * as vscode from 'vscode';
import { cmd } from '../commands';
import { Lesson } from '../models/Lesson';
import { getIcon } from '../utils/getIcon';
import isTutorialKitWorkspace from '../utils/isTutorialKit';

const metadataFiles = ['meta.md', 'meta.mdx', 'content.md', 'content.mdx'];
export const tutorialMimeType = 'application/tutorialkit.unit';

let lessonsTreeDataProvider: LessonsTreeDataProvider;
export function getLessonsTreeDataProvider() {
  return lessonsTreeDataProvider;
}
export function setLessonsTreeDataProvider(provider: LessonsTreeDataProvider) {
  lessonsTreeDataProvider = provider;
}

export class LessonsTreeDataProvider
  implements vscode.TreeDataProvider<Lesson>
{
  private lessons: Lesson[] = [];
  private isTutorialKitWorkspace = false;

  constructor(
    private readonly workspaceRoot: vscode.Uri,
    private context: vscode.ExtensionContext,
  ) {
    this.loadLessons();
  }

  private loadLessons(): void {
    try {
      const tutorialFolderPath = vscode.Uri.joinPath(
        this.workspaceRoot,
        'src',
        'content',
        'tutorial',
      ).fsPath;
      this.isTutorialKitWorkspace = true;
      this.lessons = this.loadLessonsFromFolder(tutorialFolderPath);
    } catch {
      this.isTutorialKitWorkspace = false;
    }
  }

  private loadLessonsFromFolder(folderPath: string): Lesson[] {
    const lessons: Lesson[] = [];
    const files = fs.readdirSync(folderPath);

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        const lessonName = path.basename(filePath);
        const subLessons = this.loadLessonsFromFolder(filePath);
        const lesson = new Lesson(lessonName, filePath, subLessons);

        // Check if the folder directly includes one of the metadata files
        const folderFiles = fs.readdirSync(filePath);
        const metadataFile = folderFiles.find((folderFile) =>
          metadataFiles.includes(folderFile),
        );
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

  private _onDidChangeTreeData: vscode.EventEmitter<Lesson | undefined> =
    new vscode.EventEmitter<Lesson | undefined>();
  readonly onDidChangeTreeData: vscode.Event<Lesson | undefined> =
    this._onDidChangeTreeData.event;

  refresh(): void {
    this.loadLessons();
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(lesson: Lesson): vscode.TreeItem {
    const treeItem = new vscode.TreeItem(lesson.name);
    treeItem.collapsibleState =
      lesson.children.length > 0
        ? vscode.TreeItemCollapsibleState.Collapsed
        : vscode.TreeItemCollapsibleState.None;

    treeItem.contextValue = lesson.metadata?.type;

    const shouldOpenFile = lesson.metadata?.type === 'lesson';
    treeItem.command = {
      command: cmd.goto.command,
      title: 'Go to the lesson',
      arguments: [lesson.path, lesson.metadata, shouldOpenFile],
    };

    treeItem.iconPath =
      lesson.metadata?.type === 'lesson'
        ? getIcon(this.context, 'lesson.svg')
        : getIcon(this.context, 'chapter.svg');

    return treeItem;
  }

  getChildren(element?: Lesson): Lesson[] {
    if (element) {
      return element.children;
    }
    return this.lessons;
  }
}

export async function useLessonTree() {
  // vscode.workspace.onDidChangeWorkspaceFolders((event) => {
  //   event.added.forEach((folder) => {
  //     if (isTutorialKitWorkspace(folder)) {
  //     }
  //   });
  // });

  // vscode.commands.executeCommand('setContext', 'tutorialkit:tree', true);

  cmd.initialize();

  // const tutorialWorkpaces = (vscode.workspace.workspaceFolders || []).filter(
  //   isTutorialKitWorkspace,
  // );
  // const selectedWorkspace =
  //   tutorialWorkpaces.length === 1
  //     ? tutorialWorkpaces[0]
  //     : await vscode.window
  //         .showQuickPick(
  //           tutorialWorkpaces.map((workspace) => workspace.name),
  //           {
  //             placeHolder: 'Select a workspace',
  //           },
  //         )
  //         .then((selected) =>
  //           tutorialWorkpaces.find((workspace) => workspace.name === selected),
  //         );

  // if (selectedWorkspace) {
  //   setLessonsTreeDataProvider(
  //     new LessonsTreeDataProvider(selectedWorkspace.uri, context),
  //   );
  //   context.subscriptions.push(
  //     vscode.window.createTreeView('tutorialkit-lessons-tree', {
  //       treeDataProvider: getLessonsTreeDataProvider(),
  //       canSelectMany: true,
  //     }),
  //   );
  // }
}
