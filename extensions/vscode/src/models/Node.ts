import type { TutorialSchema, PartSchema, ChapterSchema, LessonSchema } from '@tutorialkit/types';
import * as vscode from 'vscode';

export class Node {
  /**
   * Path to the meta.md / content.md file.
   */
  metadataFilePath?: vscode.Uri;

  /**
   * The metadata read from the metadata file.
   */
  metadata?: Metadata;

  /**
   * The number of expected children, populated on creation.
   * If an order is specified but more folder are found, they
   * are also included in that count but end up at the end of
   * the tree.
   */
  childCount: number = 0;

  /**
   * The children of that node, loaded lazily.
   */
  children: Node[] = [];

  /**
   * The parent of that node.
   */
  parent?: Node;

  /**
   * If specified, describe the order of the children.
   * When children are loaded, this should be used to sort
   * them appropriately.
   */
  order?: Map<string, number>;

  get type() {
    return this.metadata?.type;
  }

  get name() {
    if (this._customName) {
      return this._customName;
    }

    if (this.metadata && this.metadata.type !== 'tutorial') {
      return this.metadata.title;
    }

    return '<no name>';
  }

  constructor(
    public folderName: string,
    readonly path: vscode.Uri,
    private _customName?: string,
  ) {}

  pushChild(folderName: string) {
    this.childCount += 1;

    if (this.order) {
      this.order.set(folderName, this.order.size);

      switch (this.metadata?.type) {
        case 'chapter': {
          this.metadata.lessons!.push(folderName);
          break;
        }
        case 'tutorial': {
          this.metadata.parts!.push(folderName);
          break;
        }
        case 'part': {
          this.metadata.chapters!.push(folderName);
          break;
        }
      }
    }
  }

  removeChild(node: Node) {
    if (!removeFromArray(this.children, node)) {
      return;
    }

    if (this.order) {
      switch (this.metadata?.type) {
        case 'chapter': {
          removeFromArray(this.metadata.lessons!, node.folderName);
          break;
        }
        case 'tutorial': {
          removeFromArray(this.metadata.parts!, node.folderName);
          break;
        }
        case 'part': {
          removeFromArray(this.metadata.chapters!, node.folderName);
          break;
        }
      }
    }
  }

  setChildren(children: Node[]) {
    this.children = children;

    for (const child of this.children) {
      child.parent = this;
    }
  }
}

export type Metadata = PartSchema | ChapterSchema | LessonSchema | TutorialSchema;

export type NodeType = Metadata['type'];

function removeFromArray<T>(array: T[], element: T) {
  const index = array.indexOf(element);

  if (index != -1) {
    array.splice(index, 1);

    return true;
  }

  return false;
}
