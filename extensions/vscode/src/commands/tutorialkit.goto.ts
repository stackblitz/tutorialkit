import * as vscode from 'vscode';
import { Lesson } from '../models/Lesson';

export default (path: string, meta: Lesson['metadata'], openFile = false) => {
  vscode.commands
    .executeCommand('revealInExplorer', vscode.Uri.file(path))
    .then(() => {
      if (openFile) {
        vscode.workspace.openTextDocument(meta!._path).then((document) => {
          vscode.window.showTextDocument(document);
        });
      }
    })
    .then(() => {
      setTimeout(
        () => {
          vscode.commands.executeCommand('tutorialkit-lessons-tree.focus');
        },
        meta?.type === 'lesson' ? 30 : 0,
      );
    });
};
