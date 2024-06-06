import type { Lesson } from '@tutorialkit/types';

/**
 * Tests if the provided lesson needs to show the workspace panel or not.
 *
 * @param lesson The lesson to check the workspace for.
 */
export function hasWorkspace(lesson: Lesson) {
  if (lesson.data.editor !== false) {
    // we have a workspace if the editor is not hidden
    return true;
  }

  if (lesson.data.previews !== false) {
    // we have a workspace if the previews are shown
    return true;
  }

  if (lesson.data.terminal === false) {
    // if the value is explicitly false, it will render nothing
    return false;
  }

  if (lesson.data.terminal === true || !Array.isArray(lesson.data.terminal?.panels)) {
    // if the value is explicitly true, or `panels` is not an array, we have to render the terminal
    return true;
  }

  // we have a workspace if we have more than 0 terminal panels
  return lesson.data.terminal.panels.length > 0;
}
