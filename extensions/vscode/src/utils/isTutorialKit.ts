import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Check if the workspace is a TutorialKit workspace
 * by looking for a TutorialKit dependency in the package.json file.
 * @param folder The workspace folder to check.
 * @returns True if the workspace is a TutorialKit workspace, false otherwise.
 **/
export default function isTutorialKitWorkspace(
  folder: vscode.WorkspaceFolder,
): boolean {
  const packageJsonPath = path.join(folder.uri.fsPath, 'package.json');
  const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
  const packageJson = JSON.parse(packageJsonContent);
  const tutorialkitDependency =
    packageJson.dependencies?.['@tutorialkit/astro'] ||
    packageJson.devDependencies?.['@tutorialkit/astro'];

  return !!tutorialkitDependency;
}
