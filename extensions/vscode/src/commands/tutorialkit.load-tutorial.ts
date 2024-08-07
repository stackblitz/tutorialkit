import * as vscode from 'vscode';
import { extContext } from '../extension';
import { LessonsTreeDataProvider, setLessonsTreeDataProvider } from '../views/lessonsTree';

export async function loadTutorial(uri: vscode.Uri) {
  const treeDataProvider = new LessonsTreeDataProvider(uri, extContext);

  await treeDataProvider.init();

  setLessonsTreeDataProvider(treeDataProvider);

  extContext.subscriptions.push(
    vscode.window.createTreeView('tutorialkit-lessons-tree', {
      treeDataProvider,
      canSelectMany: true,
    }),
    treeDataProvider,
  );

  vscode.commands.executeCommand('setContext', 'tutorialkit:tree', true);
}
