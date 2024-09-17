import path from 'node:path';
import * as vscode from 'vscode';
import { cmd } from '../commands';
import { Node } from '../models/Node';
import { METADATA_FILES } from '../models/tree/constants';
import { loadChildrenForNode, loadTutorialTree } from '../models/tree/load';
import { getIcon } from '../utils/getIcon';

export const tutorialMimeType = 'application/tutorialkit.unit';

export class LessonsTreeDataProvider implements vscode.TreeDataProvider<Node>, vscode.Disposable {
  private _tutorial!: Node;
  private _tutorialName: string;
  private _onDidChangeTextDocumentDisposable: vscode.Disposable;
  private _onDidChangeTreeData: vscode.EventEmitter<Node | undefined> = new vscode.EventEmitter<Node | undefined>();

  readonly onDidChangeTreeData: vscode.Event<Node | undefined> = this._onDidChangeTreeData.event;

  constructor(
    private readonly _workspaceRoot: vscode.Uri,
    private _context: vscode.ExtensionContext,
  ) {
    this._tutorialName = path.basename(_workspaceRoot.path);

    let timeoutId: ReturnType<typeof setTimeout>;
    let loading = false;

    this._onDidChangeTextDocumentDisposable = vscode.workspace.onDidChangeTextDocument((documentChange) => {
      if (loading || !METADATA_FILES.has(path.basename(documentChange.document.fileName))) {
        return;
      }

      clearTimeout(timeoutId);

      timeoutId = setTimeout(async () => {
        loading = true;
        await this.refresh();
        loading = false;
      }, 100);
    });
  }

  dispose() {
    this._onDidChangeTextDocumentDisposable.dispose();
  }

  async init() {
    try {
      const tutorialFolderPath = vscode.Uri.joinPath(this._workspaceRoot, 'src', 'content', 'tutorial');
      this._tutorial = await loadTutorialTree(tutorialFolderPath, this._tutorialName);
    } catch {
      // do nothing
    }
  }

  async refresh() {
    await this.init();
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(node: Node): vscode.TreeItem {
    const treeItem = new vscode.TreeItem(node.name);

    if (node.type === 'tutorial') {
      treeItem.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
    } else if (node.childCount > 0) {
      treeItem.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
    } else {
      treeItem.collapsibleState = vscode.TreeItemCollapsibleState.None;
    }

    treeItem.contextValue = node.type;

    treeItem.command = {
      command: cmd.goto.command,
      title: 'Go to the lesson',
      arguments: [node.metadataFilePath],
    };

    if (node.metadata && node.type !== 'tutorial') {
      treeItem.iconPath =
        node.metadata.type === 'lesson' ? getIcon(this._context, 'lesson.svg') : getIcon(this._context, 'chapter.svg');
    }

    return treeItem;
  }

  async getChildren(element?: Node): Promise<Node[]> {
    if (element) {
      await loadChildrenForNode(element);

      return element.children;
    }

    return [this._tutorial];
  }
}

export async function useLessonTree() {
  cmd.initialize();
}
