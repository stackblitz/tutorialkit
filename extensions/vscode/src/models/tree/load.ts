import grayMatter from 'gray-matter';
import * as vscode from 'vscode';
import { Utils } from 'vscode-uri';
import { Metadata, Node } from '../Node';
import { METADATA_FILES, FILES_FOLDER, SOLUTION_FOLDER } from './constants';

export async function loadTutorialTree(tutorialFolderPath: vscode.Uri, tutorialName: string): Promise<Node> {
  const metaFilePath = vscode.Uri.joinPath(tutorialFolderPath, 'meta.md');
  const tutorial = new Node('tutorial', tutorialFolderPath, tutorialName);

  await updateNodeFromMetadata(tutorial, metaFilePath);
  await loadChildrenForNode(tutorial);

  return tutorial;
}

export async function loadChildrenForNode(node: Node) {
  if (node.type === 'lesson') {
    return;
  }

  if (node.childCount === node.children.length) {
    return;
  }

  node.setChildren(await loadTutorialTreeFromBaseFolder(node.path));

  // sort children based on their order if defined in the metadata
  const order = node.order;

  if (order) {
    node.children.sort((a, b) => {
      const aOrder = order.get(a.folderName);
      const aOrderIsDefined = aOrder !== undefined;
      const bOrder = order.get(b.folderName);
      const bOrderIsDefined = bOrder !== undefined;

      if (aOrderIsDefined && bOrderIsDefined) {
        return aOrder - bOrder;
      }

      if (aOrderIsDefined) {
        return -1;
      }

      if (bOrderIsDefined) {
        return 1;
      }

      return a.folderName.localeCompare(b.folderName);
    });
  } else {
    node.children.sort((a, b) => a.folderName.localeCompare(b.folderName));
  }
}

async function loadTutorialTreeFromBaseFolder(baseFolderPath: vscode.Uri): Promise<Node[]> {
  const nodes: Node[] = [];
  const files = await vscode.workspace.fs.readDirectory(baseFolderPath);

  await Promise.all(
    files.map(async ([folderName, fileType]) => {
      if (fileType !== vscode.FileType.Directory) {
        return;
      }

      const folderPath = vscode.Uri.joinPath(baseFolderPath, folderName);
      const node = new Node(folderName, folderPath);

      // check if the folder directly includes one of the metadata files
      const folderFiles = await vscode.workspace.fs.readDirectory(folderPath);
      const [metadataFile] = folderFiles.find(([folderFile]) => METADATA_FILES.has(folderFile)) ?? [];

      if (metadataFile) {
        await updateNodeFromMetadata(node, vscode.Uri.joinPath(folderPath, metadataFile));

        nodes.push(node);
      }
    }),
  );

  return nodes;
}

async function updateNodeFromMetadata(node: Node, metadataFilePath: vscode.Uri) {
  const folderPath = Utils.dirname(metadataFilePath);
  const metadataFileContent = await readFileContent(metadataFilePath);
  const parsedContent = grayMatter(metadataFileContent);

  node.metadataFilePath = metadataFilePath;
  node.metadata = parsedContent.data as Metadata;
  node.childCount = node.type === 'lesson' ? 0 : await getChildCount(folderPath);
  node.order = getOrder(node.metadata);
}

function getOrder(metadata: Metadata): Map<string, number> | undefined {
  switch (metadata.type) {
    case 'part': {
      return fromArrayToInversedMap(metadata.chapters);
    }
    case 'chapter': {
      return fromArrayToInversedMap(metadata.lessons);
    }
    case 'tutorial': {
      return fromArrayToInversedMap(metadata.parts);
    }
    default: {
      return;
    }
  }
}

function fromArrayToInversedMap(arr: string[] | undefined): Map<string, number> | undefined {
  if (!arr) {
    return;
  }

  return new Map(
    (function* () {
      for (const [index, value] of arr.entries()) {
        yield [value, index] as const;
      }
    })(),
  );
}

async function getChildCount(nodeFolder: vscode.Uri): Promise<number> {
  const filesInFolder = await vscode.workspace.fs.readDirectory(nodeFolder);

  let childCount = 0;

  for (const [file, fileType] of filesInFolder) {
    if (fileType !== vscode.FileType.Directory || file === FILES_FOLDER || file === SOLUTION_FOLDER) {
      continue;
    }

    childCount += 1;
  }

  return childCount;
}

async function readFileContent(filePath: vscode.Uri): Promise<string> {
  const document = vscode.workspace.textDocuments.find((document) => document.uri.toString() === filePath.toString());

  if (document) {
    return document.getText();
  }

  const binContent = await vscode.workspace.fs.readFile(filePath);

  return new TextDecoder().decode(binContent);
}
