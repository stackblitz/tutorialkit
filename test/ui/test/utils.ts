import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const TESTS_DIR = fileURLToPath(new URL('../src/content/tutorial/tests', import.meta.url));

export function readLessonFilesAndSolution(
  ...lessons: string[]
): Record<string, { files: Record<string, string>; solution: Record<string, string> }> {
  return lessons.reduce(
    (all, lesson) => ({
      ...all,
      [lesson.split('/')[1]]: {
        files: readDirFiles(`${TESTS_DIR}/${lesson}/_files`),
        solution: readDirFiles(`${TESTS_DIR}/${lesson}/_solution`),
      },
    }),
    {},
  );
}

function readDirFiles(dir: string): Record<string, string> {
  if (!existsSync(dir)) {
    return {};
  }

  return readdirSync(dir).reduce(
    (files, file) => ({
      ...files,
      [file]: readFileSync(`${dir}/${file}`, 'utf8'),
    }),
    {},
  );
}
