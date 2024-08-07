import * as vscode from 'vscode';
import type { TutorialSchema, PartSchema, ChapterSchema, LessonSchema } from '@tutorialkit/types';

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
}

export type Metadata = PartSchema | ChapterSchema | LessonSchema | TutorialSchema;

export type NodeType = Metadata['type'];
