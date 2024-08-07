import { cmd } from '.';
import * as vscode from 'vscode';
import { Node } from '../models/Node';

export async function deleteUnit(node: Node) {
  await vscode.workspace.fs.delete(node.path, { recursive: true });

  return cmd.refresh();
}
