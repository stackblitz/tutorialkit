import { cmd } from '.';
import * as vscode from 'vscode';
import { Node } from '../models/Node';
import { getLessonsTreeView } from '../global-state';
import { updateNodeMetadataInVFS } from '../models/tree/update';

export async function deleteNode(selectedNode: Node | undefined, selectedNodes: Node[] | undefined) {
  let nodes: readonly Node[] = (selectedNodes ? selectedNodes : [selectedNode]).filter((node) => node !== undefined);

  if (nodes.length === 0) {
    nodes = getLessonsTreeView().selection;
  }

  const parents = new Set<Node>();

  for (const node of nodes) {
    if (node.parent) {
      parents.add(node.parent);
      node.parent.removeChild(node);
    }

    await vscode.workspace.fs.delete(node.path, { recursive: true });
  }

  // remove all nodes from parents that that might have been parent of other deleted nodes
  for (const node of nodes) {
    parents.delete(node);
  }

  for (const parent of parents) {
    await updateNodeMetadataInVFS(parent);
  }

  return cmd.refresh();
}
