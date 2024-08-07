import * as vscode from 'vscode';

export default async (path: string | vscode.Uri | undefined) => {
  if (!path) {
    return;
  }

  /**
   * This cast to 'any' makes no sense because if we narrow the type of path
   * there are no type errors. So this code:
   *
   * ```ts
   * typeof path === 'string'
   *   ? await vscode.workspace.openTextDocument(path)
   *   : await vscode.workspace.openTextDocument(path)
   * ;
   * ```
   *
   * type check correctly despite doing nothing different on each branch.
   *
   * To avoid this TypeScript bug here we just cast to any.
   */
  const document = await vscode.workspace.openTextDocument(path as any);

  await vscode.window.showTextDocument(document, {
    preserveFocus: true,
  });
};
