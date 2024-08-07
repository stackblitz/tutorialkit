import type { TreeView } from 'vscode';
import type { LessonsTreeDataProvider } from './views/lessonsTree';
import type { Node } from './models/Node';

let lessonsTreeDataProvider: LessonsTreeDataProvider;
let lessonsTreeView: TreeView<Node>;

export function getLessonsTreeDataProvider() {
  return lessonsTreeDataProvider;
}

export function getLessonsTreeView() {
  return lessonsTreeView;
}

export function setLessonsTreeDataProvider(provider: LessonsTreeDataProvider) {
  lessonsTreeDataProvider = provider;
}

export function setLessonsTreeView(treeView: TreeView<Node>) {
  lessonsTreeView = treeView;
}
