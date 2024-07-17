import * as vscode from 'vscode';
import { extContext } from '../extension';
import { LessonsTreeDataProvider, getLessonsTreeDataProvider, setLessonsTreeDataProvider } from '../views/lessonsTree';

export async function loadTutorial(uri: vscode.Uri) {
  setLessonsTreeDataProvider(new LessonsTreeDataProvider(uri, extContext));

  extContext.subscriptions.push(
    vscode.window.createTreeView('tutorialkit-lessons-tree', {
      treeDataProvider: getLessonsTreeDataProvider(),
      canSelectMany: true,
    }),
  );

  vscode.commands.executeCommand('setContext', 'tutorialkit:tree', true);
}
