import * as vscode from 'vscode';
import tutorialkitGoto from './tutorialkit.goto';
import tutorialkitRefresh from './tutorialkit.refresh';
import { addChapter, addLesson } from './tutorialkit.add';
import { selectTutorial } from './tutorialkit.select-tutorial';
import { loadTutorial } from './tutorialkit.load-tutorial';
import { initialize } from './tutorialkit.initialize';

// No need to use these consts outsite of this file
// – use `cmd[name].command` instead
const CMD = {
  INITIALIZE: 'tutorialkit.initialize',
  SELECT_TUTORIAL: 'tutorialkit.select-tutorial',
  LOAD_TUTORIAL: 'tutorialkit.load-tutorial',
  GOTO: 'tutorialkit.goto',
  ADD_LESSON: 'tutorialkit.add-lesson',
  ADD_CHAPTER: 'tutorialkit.add-chapter',
  REFRESH: 'tutorialkit.refresh',
} as const;

// Register all commands in Code IDE
export function useCommands() {
  vscode.commands.registerCommand(CMD.INITIALIZE, initialize);
  vscode.commands.registerCommand(CMD.SELECT_TUTORIAL, selectTutorial);
  vscode.commands.registerCommand(CMD.LOAD_TUTORIAL, loadTutorial);
  vscode.commands.registerCommand(CMD.GOTO, tutorialkitGoto);
  vscode.commands.registerCommand(CMD.ADD_LESSON, addLesson);
  vscode.commands.registerCommand(CMD.ADD_CHAPTER, addChapter);
  vscode.commands.registerCommand(CMD.REFRESH, tutorialkitRefresh);
}

// Create typesafe commands
export const cmd = {
  initialize: createExecutor<typeof initialize>(CMD.INITIALIZE),
  selectTutorial: createExecutor<typeof selectTutorial>(CMD.SELECT_TUTORIAL),
  loadTutorial: createExecutor<typeof loadTutorial>(CMD.LOAD_TUTORIAL),
  goto: createExecutor<typeof tutorialkitGoto>(CMD.GOTO),
  addLesson: createExecutor<typeof addLesson>(CMD.ADD_LESSON),
  addChapter: createExecutor<typeof addChapter>(CMD.ADD_CHAPTER),
  refresh: createExecutor<typeof tutorialkitRefresh>(CMD.REFRESH),
};

function createExecutor<T extends (...args: any) => any>(name: string) {
  function executor(...args: Parameters<T>) {
    return vscode.commands.executeCommand(name, ...args);
  }
  executor.command = name;
  return executor;
}
