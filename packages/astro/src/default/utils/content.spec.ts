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

test('single part, multiple chapters', async (ctx) => {
  getCollection.mockReturnValueOnce([
    { id: 'meta.md', ...tutorial },
    { id: '1-part/meta.md', ...part },

    // 3 chapters
    { id: '1-part/1-chapter/meta.md', ...chapter },
    { id: '1-part/2-chapter/meta.md', ...chapter },
    { id: '1-part/3-chapter/meta.md', ...chapter },

    { id: '1-part/1-chapter/1-first/content.md', ...lesson },
    { id: '1-part/2-chapter/1-second/content.md', ...lesson },
    { id: '1-part/3-chapter/1-third/content.md', ...lesson },
  ]);

  const collection = await getTutorial();

  const chapters = collection.parts['1-part'].chapters;
  expect(Object.keys(chapters)).toHaveLength(3);

  await expect(collection).toMatchFileSnapshot(snapshotName(ctx));
});

test('multiple parts', async (ctx) => {
  getCollection.mockReturnValueOnce([
    { id: 'meta.md', ...tutorial },

    // 3 parts
    { id: '1-part/meta.md', ...part },
    { id: '2-part/meta.md', ...part },
    { id: '3-part/meta.md', ...part },

    { id: '1-part/1-chapter/meta.md', ...chapter },
    { id: '2-part/2-chapter/meta.md', ...chapter },
    { id: '3-part/3-chapter/meta.md', ...chapter },

    { id: '1-part/1-chapter/1-first/content.md', ...lesson },
    { id: '2-part/2-chapter/1-second/content.md', ...lesson },
    { id: '3-part/3-chapter/1-third/content.md', ...lesson },
  ]);

  const collection = await getTutorial();
  expect(Object.keys(collection.parts)).toHaveLength(3);

  await expect(collection).toMatchFileSnapshot(snapshotName(ctx));
});

test('lesson inherits metadata from tutorial', async () => {
  const data: CollectionEntryTutorial['data'] = {
    type: 'tutorial',
    autoReload: true,
    editor: { fileTree: { allowEdits: ['some-pattern/**'] } },
    editPageLink: 'example-link',
    filesystem: { watch: true },
    focus: '/index.js',
    i18n: { confirmationText: 'example' },
    mainCommand: 'ls',
    prepareCommands: ['npm i'],
    openInStackBlitz: { projectTitle: 'example' },
    previews: ['8080', '3000'],
    template: 'vite',
    terminal: { panels: ['output', 'terminal'] },
  };

  getCollection.mockReturnValueOnce([
    { id: 'meta.md', ...tutorial, data },
    { id: '1-part/meta.md', ...part },
    { id: '1-part/1-chapter/meta.md', ...chapter },
    { id: '1-part/1-chapter/1-lesson/content.md', ...lesson },
  ]);

  const collection = await getTutorial();
  const { data: lessonData } = collection.parts['1-part'].chapters['1-chapter'].lessons['1-lesson'];

  expect(lessonData).toStrictEqual({ ...data, type: 'lesson', title: lesson.data.title });
});

test('lesson inherits metadata cascaded form all higher levels', async () => {
  getCollection.mockReturnValueOnce([
    {
      id: 'meta.md',
      ...tutorial,
      data: {
        ...tutorial.data,
        editPageLink: 'edit link from tutorial',
        focus: 'this should be overwritten',
        mainCommand: 'this should be overwritten',
        template: 'this should be overwritten',
      },
    },
    {
      id: '1-part/meta.md',
      ...part,
      data: {
        ...part.data,
        focus: 'focus from part',
        mainCommand: 'this should be overwritten',
        template: 'this should be overwritten',
      },
    },
    {
      id: '1-part/1-chapter/meta.md',
      ...chapter,
      data: {
        ...chapter.data,
        mainCommand: 'main command from chapter',
        template: 'this should be overwritten',
      },
    },
    {
      id: '1-part/1-chapter/1-lesson/content.md',
      ...lesson,
      data: { ...lesson.data, template: 'template from lesson' },
    },
  ]);

  const collection = await getTutorial();
  const { data: lessonData } = collection.parts['1-part'].chapters['1-chapter'].lessons['1-lesson'];

  expect(lessonData.editPageLink).toBe('edit link from tutorial');
  expect(lessonData.focus).toBe('focus from part');
  expect(lessonData.mainCommand).toBe('main command from chapter');
  expect(lessonData.template).toBe('template from lesson');
});

test('throws when tutorial metadata not found', async () => {
  getCollection.mockReturnValueOnce([
    { id: '1-part/meta.md', ...part },
    { id: '1-part/1-chapter/meta.md', ...chapter },
    { id: '1-part/1-chapter/1-first/content.md', ...lesson },
  ]);

  await expect(getTutorial).rejects.toThrowErrorMatchingInlineSnapshot(
    `[Error: Could not find tutorial 'meta.md' file]`,
  );
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

const tutorial = {
  slug: 'tutorial-slug',
  body: 'Hello world',
  collection: 'tutorial',
  data: { type: 'tutorial' },
} satisfies Omit<CollectionEntryTutorial, 'render' | 'id'>;

const part = {
  slug: 'part-slug',
  body: 'Hello world',
  collection: 'tutorial',
  data: { type: 'part', title: 'Basics' },
} satisfies Omit<CollectionEntryTutorial, 'render' | 'id'>;

const chapter = {
  slug: 'chapter-slug',
  body: 'body here',
  collection: 'tutorial',
  data: { title: 'The first chapter in part 1', type: 'chapter' },
} satisfies Omit<CollectionEntryTutorial, 'render' | 'id'>;

const lesson = {
  slug: 'lesson-slug',
  body: 'body here',
  collection: 'tutorial',
  data: { type: 'lesson', title: 'Welcome to TutorialKit' },
  render: () => ({ Content: 'Markdown for tutorial' }) as unknown as ReturnType<CollectionEntryTutorial['render']>,
} satisfies Omit<CollectionEntryTutorial, 'id'>;

function snapshotName(ctx: TaskContext) {
  const testName = ctx.task.name.replaceAll(',', '').replaceAll(' ', '-');

  return `__snapshots__/${testName}.json`;
}
