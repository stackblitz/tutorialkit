import * as vscode from 'vscode';
import { useCommands } from './commands';
import { useLessonTree } from './views/lessonsTree';

export let extContext: vscode.ExtensionContext;

export function activate(context: vscode.ExtensionContext) {
  extContext = context;

  useCommands();
  useLessonTree();
}

export function deactivate() {}
