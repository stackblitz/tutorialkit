import * as content from 'astro:content';
import { expect, test, vi, type TaskContext } from 'vitest';
import { getTutorial, type CollectionEntryTutorial } from './content';

const getCollection = vi.mocked(content.getCollection);
vi.mock('astro:content', () => ({ getCollection: vi.fn() }));

// mock DEFAULT_LOCALIZATION so that we don't need to update test results everytime new keys are added there
vi.mock(import('@tutorialkit/types'), async (importOriginal) => ({
  ...(await importOriginal()),
  DEFAULT_LOCALIZATION: { mocked: 'default localization' } as any,
}));

expect.addSnapshotSerializer({
  serialize: (val) => JSON.stringify(val, null, 2),
  test: (value) => !(value instanceof Error),
});

test('single part, chapter and lesson', async (ctx) => {
  getCollection.mockReturnValueOnce([
    { id: 'meta.md', ...tutorial },
    { id: '1-part/meta.md', ...part },
    { id: '1-part/1-chapter/meta.md', ...chapter },
    { id: '1-part/1-chapter/1-lesson/content.md', ...lesson },
  ]);

  const collection = await getTutorial();
  await expect(collection).toMatchFileSnapshot(snapshotName(ctx));
});

test('single part, chapter and multiple lessons', async (ctx) => {
  getCollection.mockReturnValueOnce([
    { id: 'meta.md', ...tutorial },
    { id: '1-part/meta.md', ...part },
    { id: '1-part/1-chapter/meta.md', ...chapter },

    // 3 lessons
    { id: '1-part/1-chapter/1-first/content.md', ...lesson },
    { id: '1-part/1-chapter/2-second/content.md', ...lesson },
    { id: '1-part/1-chapter/3-third/content.md', ...lesson },
  ]);

  const collection = await getTutorial();

  const lessons = collection.parts['1-part'].chapters['1-chapter'].lessons;
  expect(Object.keys(lessons)).toHaveLength(3);

  await expect(collection).toMatchFileSnapshot(snapshotName(ctx));
});

test('throws when part not found', async () => {
  getCollection.mockReturnValueOnce([
    { id: 'meta.md', ...tutorial },
    { id: '2-part/meta.md', ...part },
    { id: '1-part/1-chapter/meta.md', ...chapter },
    { id: '1-part/1-chapter/1-first/content.md', ...lesson },
  ]);

  await expect(getTutorial).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: Could not find part '1-part']`);
});

test('throws when chapter not found', async () => {
  getCollection.mockReturnValueOnce([
    { id: 'meta.md', ...tutorial },
    { id: '1-part/meta.md', ...part },
    { id: '1-part/2-chapter/meta.md', ...chapter },
    { id: '1-part/1-chapter/1-first/content.md', ...lesson },
  ]);

  await expect(getTutorial).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: Could not find chapter '1-chapter']`);
});

const tutorial: Omit<CollectionEntryTutorial, 'render' | 'id'> = {
  slug: 'tutorial-slug',
  body: 'Hello world',
  collection: 'tutorial',
  data: { type: 'tutorial' },
};

const part: Omit<CollectionEntryTutorial, 'render' | 'id'> = {
  slug: 'part-slug',
  body: 'Hello world',
  collection: 'tutorial',
  data: { type: 'part', title: 'Basics' },
};

const chapter: Omit<CollectionEntryTutorial, 'render' | 'id'> = {
  slug: 'chapter-slug',
  body: 'body here',
  collection: 'tutorial',
  data: { title: 'The first chapter in part 1', type: 'chapter' },
};

const lesson: Omit<CollectionEntryTutorial, 'id'> = {
  slug: 'lesson-slug',
  body: 'body here',
  collection: 'tutorial',
  data: { type: 'lesson', title: 'Welcome to TutorialKit' },
  render: () => ({ Content: 'Markdown for tutorial' }) as unknown as ReturnType<CollectionEntryTutorial['render']>,
};

function snapshotName(ctx: TaskContext) {
  const testName = ctx.task.name.replaceAll(',', '').replaceAll(' ', '-');

  return `__snapshots__/${testName}.json`;
}
