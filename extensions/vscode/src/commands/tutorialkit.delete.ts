import { cmd } from '.';
import * as vscode from 'vscode';
import { Node } from '../models/Node';
import { getLessonsTreeView } from '../global-state';

export async function deleteUnit(selectedNode: Node | undefined, selectedNodes: Node[] | undefined) {
  let nodes: readonly Node[] = (selectedNodes ? selectedNodes : [selectedNode]).filter((node) => node !== undefined);

  if (nodes.length === 0) {
    nodes = getLessonsTreeView().selection;
  }

  for (const node of nodes) {
    await vscode.workspace.fs.delete(node.path, { recursive: true });
  }

  return cmd.refresh();
}
