import { cmd } from '.';
import { Lesson, LessonType } from '../models/Lesson';
import * as vscode from 'vscode';

let kebabCase: (string: string) => string;
let capitalize: (string: string) => string;

(async () => {
  const module = await import('case-anything');
  kebabCase = module.kebabCase;
  capitalize = module.capitalCase;
})();

export async function addLesson(parent: Lesson) {
  const lessonNumber = parent.children.length + 1;

  const lessonName = await getUnitName('lesson', lessonNumber);

  const lessonFolderPath = await createUnitFolder(parent.path, lessonNumber, lessonName, 'lesson');

  await vscode.workspace.fs.createDirectory(vscode.Uri.file(`${lessonFolderPath}/_files`));
  await vscode.workspace.fs.createDirectory(vscode.Uri.file(`${lessonFolderPath}/_solution`));

  await cmd.refresh();

  return navigateToUnit(lessonFolderPath, 'lesson');
}

export async function addChapter(parent: Lesson) {
  const chapterNumber = parent.children.length + 1;

  const chapterName = await getUnitName('chapter', chapterNumber);

  const chapterFolderPath = await createUnitFolder(parent.path, chapterNumber, chapterName, 'chapter');

  await navigateToUnit(chapterFolderPath, 'chapter');

  await cmd.refresh();
}

async function getUnitName(unitType: LessonType, unitNumber: number) {
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

async function createUnitFolder(parentPath: string, unitNumber: number, unitName: string, unitType: LessonType) {
  const unitFolderPath = `${parentPath}/${unitNumber}-${kebabCase(unitName)}`;
  const metaFile = unitType === 'lesson' ? 'content.mdx' : 'meta.md';

  await vscode.workspace.fs.writeFile(
    vscode.Uri.file(`${unitFolderPath}/${metaFile}`),
    new TextEncoder().encode(`---\ntype: ${unitType}\ntitle: ${unitName}\n---\n`),
  );

  return unitFolderPath;
}

async function navigateToUnit(path: string, unitType: LessonType) {
  const metaFile = unitType === 'lesson' ? 'content.mdx' : 'meta.md';

  return cmd.goto(`${path}/${metaFile}`);
}
