import * as vscode from 'vscode';

export default async (path: string | undefined) => {
  if (!path) {
    return;
  }

  const document = await vscode.workspace.openTextDocument(path);

  await vscode.window.showTextDocument(document, {
    preserveFocus: true,
  });
};
