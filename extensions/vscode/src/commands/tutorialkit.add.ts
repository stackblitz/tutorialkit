import * as vscode from 'vscode';
import { Node, NodeType } from '../models/Node';
import { FILES_FOLDER, SOLUTION_FOLDER } from '../models/tree/constants';
import { updateNodeMetadataInVFS } from '../models/tree/update';
import { cmd } from '.';

let kebabCase: (string: string) => string;
let capitalize: (string: string) => string;

(async () => {
  const module = await import('case-anything');
  kebabCase = module.kebabCase;
  capitalize = module.capitalCase;
})();

export async function addLesson(parent: Node) {
  const { folderPath, metaFilePath } = await createNodeFolder(parent, 'lesson');

  await vscode.workspace.fs.createDirectory(vscode.Uri.joinPath(folderPath, FILES_FOLDER));
  await vscode.workspace.fs.createDirectory(vscode.Uri.joinPath(folderPath, SOLUTION_FOLDER));

  await cmd.refresh();

  return cmd.goto(metaFilePath);
}

export async function addChapter(parent: Node) {
  const { metaFilePath } = await createNodeFolder(parent, 'chapter');

  await cmd.refresh();

  return cmd.goto(metaFilePath);
}

export async function addPart(parent: Node) {
  const { metaFilePath } = await createNodeFolder(parent, 'part');

  await cmd.refresh();

  return cmd.goto(metaFilePath);
}

async function getNodeName(unitType: NodeType, unitNumber: number) {
  const unitName = await vscode.window.showInputBox({
    prompt: `Enter the name of the new ${unitType}`,
    value: `${capitalize(unitType)} ${unitNumber}`,
  });

  // break if no name provided
  if (!unitName) {
    throw new Error(`No ${unitType} name provided`);
  }

  return unitName;
}

async function createNodeFolder(parent: Node, nodeType: NodeType) {
  const unitNumber = parent.children.length + 1;
  const unitName = await getNodeName(nodeType, unitNumber);
  const unitFolderPath = parent.order ? kebabCase(unitName) : `${unitNumber}-${kebabCase(unitName)}`;

  const metaFile = nodeType === 'lesson' ? 'content.mdx' : 'meta.md';
  const metaFilePath = vscode.Uri.joinPath(parent.path, unitFolderPath, metaFile);

  if (parent.order) {
    parent.pushChild(unitFolderPath);
    await updateNodeMetadataInVFS(parent);
  }

  await vscode.workspace.fs.writeFile(
    metaFilePath,
    new TextEncoder().encode(`---\ntype: ${nodeType}\ntitle: ${unitName}\n---\n`),
  );

  return {
    folderPath: vscode.Uri.joinPath(parent.path, unitFolderPath),
    metaFilePath,
  };
}
