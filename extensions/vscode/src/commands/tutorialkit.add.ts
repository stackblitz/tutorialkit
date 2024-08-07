import { cmd } from '.';
import { Node, NodeType } from '../models/Node';
import * as vscode from 'vscode';
import { FILES_FOLDER, SOLUTION_FOLDER } from '../models/tree/constants';
import { updateNodeMetadataInVFS } from '../models/tree/update';

let kebabCase: (string: string) => string;
let capitalize: (string: string) => string;

(async () => {
  const module = await import('case-anything');
  kebabCase = module.kebabCase;
  capitalize = module.capitalCase;
})();

export async function addLesson(parent: Node) {
  const { folderPath, metaFilePath } = await createUnitFolder(parent, 'lesson');

  await vscode.workspace.fs.createDirectory(vscode.Uri.joinPath(folderPath, FILES_FOLDER));
  await vscode.workspace.fs.createDirectory(vscode.Uri.joinPath(folderPath, SOLUTION_FOLDER));

  await cmd.refresh();

  return cmd.goto(metaFilePath);
}

export async function addChapter(parent: Node) {
  const { metaFilePath } = await createUnitFolder(parent, 'chapter');

  await cmd.refresh();

  return cmd.goto(metaFilePath);
}

export async function addPart(parent: Node) {
  const { metaFilePath } = await createUnitFolder(parent, 'part');

  await cmd.refresh();

  return cmd.goto(metaFilePath);
}

async function getUnitName(unitType: NodeType, unitNumber: number) {
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

async function createUnitFolder(parent: Node, unitType: NodeType) {
  const unitNumber = parent.children.length + 1;
  const unitName = await getUnitName(unitType, unitNumber);
  const unitFolderPath = parent.order ? kebabCase(unitName) : `${unitNumber}-${kebabCase(unitName)}`;

  const metaFile = unitType === 'lesson' ? 'content.mdx' : 'meta.md';
  const metaFilePath = vscode.Uri.joinPath(parent.path, unitFolderPath, metaFile);

  if (parent.order) {
    parent.pushChild(unitFolderPath);
    await updateNodeMetadataInVFS(parent);
  }

  await vscode.workspace.fs.writeFile(
    metaFilePath,
    new TextEncoder().encode(`---\ntype: ${unitType}\ntitle: ${unitName}\n---\n`),
  );

  return {
    folderPath: vscode.Uri.joinPath(parent.path, unitFolderPath),
    metaFilePath,
  };
}
