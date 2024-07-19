import * as vscode from 'vscode';
import { cmd } from '.';
import isTutorialKitWorkspace from '../utils/isTutorialKit';

export async function selectTutorial() {
  const tutorialWorkpaces = (vscode.workspace.workspaceFolders || []).filter(isTutorialKitWorkspace);

  const selectedWorkspace =
    tutorialWorkpaces.length === 1
      ? tutorialWorkpaces[0]
      : await vscode.window
          .showQuickPick(
            tutorialWorkpaces.map((workspace) => workspace.name),
            {
              placeHolder: 'Select a workspace',
            },
          )
          .then((selected) => tutorialWorkpaces.find((workspace) => workspace.name === selected));

  if (selectedWorkspace) {
    cmd.loadTutorial(selectedWorkspace.uri);
  }
}
