import * as vscode from 'vscode';
import isTutorialKitWorkspace from '../utils/isTutorialKit';
import { cmd } from '.';

export async function initialize(toastIfEmpty = false) {
  const tutorialWorkpaces = (vscode.workspace.workspaceFolders || []).filter(
    isTutorialKitWorkspace,
  );

  if (tutorialWorkpaces.length === 0) {
    if (toastIfEmpty) {
      vscode.window.showInformationMessage(
        'No TutorialKit project found in the current workspace. Make sure there is a "@tutorialkit/astro" dependency or devDependency in your package.json file.',
      );
      vscode.commands.executeCommand('setContext', 'tutorialkit:tree', false);
    }
  } else if (tutorialWorkpaces.length === 1) {
    cmd.loadTutorial(tutorialWorkpaces[0].uri);
  } else if (tutorialWorkpaces.length > 1) {
    vscode.commands.executeCommand(
      'setContext',
      'tutorialkit:multiple-tutorials',
      true,
    );
    vscode.commands.executeCommand('setContext', 'tutorialkit:tree', false);
  }

  vscode.commands.executeCommand('setContext', 'tutorialkit:initialized', true);
}
