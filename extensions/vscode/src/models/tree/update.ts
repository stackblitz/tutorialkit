import grayMatter from 'gray-matter';
import * as vscode from 'vscode';
import { Node } from '../Node';

export async function updateNodeMetadataInVFS(node: Node) {
  if (!node.metadata || !node.metadataFilePath) {
    return;
  }

  const filePath = node.metadataFilePath;
  const document = vscode.workspace.textDocuments.find((document) => document.uri.toString() === filePath.toString());

  const content = document ? document.getText() : await readContentAsString(filePath);

  const parsedContent = grayMatter(content);
  const frontMatterEnd = content.length - parsedContent.content.length;
  const newMetadata = grayMatter.stringify('', node.metadata);

  if (document) {
    const edit = new vscode.WorkspaceEdit();
    const range = new vscode.Range(document.positionAt(0), document.positionAt(frontMatterEnd));

    edit.replace(filePath, range, newMetadata, { needsConfirmation: false, label: `Updated ${node.name}` });

    await vscode.workspace.applyEdit(edit);
  } else {
    const newContent = new TextEncoder().encode(newMetadata + parsedContent.content);
    await vscode.workspace.fs.writeFile(filePath, newContent);
  }
}

async function readContentAsString(filePath: vscode.Uri) {
  const binContent = await vscode.workspace.fs.readFile(filePath);

  return new TextDecoder().decode(binContent);
}
