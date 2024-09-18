import * as vscode from 'vscode';
import { extContext } from '../extension';
import { setLessonsTreeDataProvider, setLessonsTreeView } from '../global-state';
import { LessonsTreeDataProvider } from '../views/lessonsTree';

export async function loadTutorial(uri: vscode.Uri) {
  const treeDataProvider = new LessonsTreeDataProvider(uri, extContext);

  await treeDataProvider.init();

  const treeView = vscode.window.createTreeView('tutorialkit-lessons-tree', {
    treeDataProvider,
    canSelectMany: true,
  });

  setLessonsTreeDataProvider(treeDataProvider);
  setLessonsTreeView(treeView);

  extContext.subscriptions.push(treeView, treeDataProvider);

  vscode.commands.executeCommand('setContext', 'tutorialkit:tree', true);
}
