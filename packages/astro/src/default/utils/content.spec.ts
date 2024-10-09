import * as content from 'astro:content';
import { describe, expect, test, vi, type TaskContext } from 'vitest';
import { getTutorial, type CollectionEntryTutorial } from './content';
import { logger } from './logger';

const getCollection = vi.mocked<() => Omit<CollectionEntryTutorial, 'render'>[]>(content.getCollection);
vi.mock('astro:content', () => ({ getCollection: vi.fn() }));

// mock DEFAULT_LOCALIZATION so that we don't need to update test results everytime new keys are added there
vi.mock(import('@tutorialkit/types'), async (importOriginal) => ({
  ...(await importOriginal()),
  DEFAULT_LOCALIZATION: { mocked: 'default localization' } as any,
}));

vi.mock(import('./logger'), async (importOriginal) => importOriginal());

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

  const lessons = collection.lessons;
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

test('lessons with identical names in different chapters', async () => {
  getCollection.mockReturnValueOnce([
    { id: 'meta.md', ...tutorial },
    { id: '1-part/meta.md', ...part },

    { id: '1-part/1-chapter/meta.md', ...chapter },
    {
      id: '1-part/1-chapter/identical-lesson-name/content.md',
      ...lesson,
      data: { ...lesson.data, focus: '/first.js' },
    },

    { id: '1-part/2-chapter/meta.md', ...chapter },
    {
      id: '1-part/2-chapter/identical-lesson-name/content.md',
      ...lesson,
      data: { ...lesson.data, focus: '/second.js' },
    },
  ]);

  const collection = await getTutorial();
  const lessons = collection.lessons;

  // verify that lesson.id is not used to define what makes a lesson unique (part.id + chapter.id too)
  expect(lessons).toHaveLength(2);
  expect(lessons[0].id).toBe('identical-lesson-name');
  expect(lessons[1].id).toBe('identical-lesson-name');

  expect(lessons[0].data.focus).toBe('/first.js');
  expect(lessons[1].data.focus).toBe('/second.js');

  expect(lessons[0].chapter.id).toBe('1-chapter');
  expect(lessons[1].chapter.id).toBe('2-chapter');

  expect(lessons[0].part.id).toBe('1-part');
  expect(lessons[1].part.id).toBe('1-part');
});

describe('metadata inheriting', () => {
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
    const { data: lessonData } = collection.lessons[0];

    expect(lessonData).toStrictEqual({ ...data, type: 'lesson', title: lesson.data.title });
  });

  test('lesson inherits metadata cascaded from all higher levels', async () => {
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
    const { data: lessonData } = collection.lessons[0];

    expect(lessonData.editPageLink).toBe('edit link from tutorial');
    expect(lessonData.focus).toBe('focus from part');
    expect(lessonData.mainCommand).toBe('main command from chapter');
    expect(lessonData.template).toBe('template from lesson');
  });
});

describe('ordering', () => {
  test('parts are ordered by default', async () => {
    getCollection.mockReturnValueOnce([
      { id: 'meta.md', ...tutorial },
      { id: '2-part/meta.md', ...part },
      { id: '3-part/meta.md', ...part },
      { id: '1-part/meta.md', ...part },
    ]);

    const collection = await getTutorial();
    const parts = collection.parts;

    expect(parts['1-part'].order).toBe(0);
    expect(parts['2-part'].order).toBe(1);
    expect(parts['3-part'].order).toBe(2);
  });

  test('parts are ordered by metadata', async () => {
    getCollection.mockReturnValueOnce([
      {
        id: 'meta.md',
        ...tutorial,
        data: { ...tutorial.data, parts: ['3-part', '1-part', '2-part'] },
      },
      { id: '2-part/meta.md', ...part },
      { id: '3-part/meta.md', ...part },
      { id: '1-part/meta.md', ...part },
    ]);

    const collection = await getTutorial();
    const parts = collection.parts;

    expect(parts['3-part'].order).toBe(0);
    expect(parts['1-part'].order).toBe(1);
    expect(parts['2-part'].order).toBe(2);
  });

  test('parts not mention in order are excluded ', async () => {
    vi.spyOn(logger, 'warn').mockImplementationOnce(vi.fn());

    getCollection.mockReturnValueOnce([
      {
        id: 'meta.md',
        ...tutorial,
        data: { ...tutorial.data, parts: ['2-part', '1-part'] },
      },
      { id: '2-part/meta.md', ...part },
      { id: 'excluded-part/meta.md', ...part },
      { id: '1-part/meta.md', ...part },
    ]);

    const collection = await getTutorial();
    const parts = collection.parts;

    expect(Object.keys(parts)).toHaveLength(2);
    expect(parts['excluded-part']).toBeUndefined();
    expect(parts['1-part']).toBeDefined();
    expect(parts['2-part']).toBeDefined();

    expect(vi.mocked(logger.warn).mock.calls[0][0]).toMatchInlineSnapshot(
      `"An order was specified for the parts of the tutorial but 'excluded-part' is not included so it won't be visible."`,
    );
  });

  test('chapters are ordered by default', async () => {
    getCollection.mockReturnValueOnce([
      { id: 'meta.md', ...tutorial },
      { id: '1-part/meta.md', ...part },
      { id: '1-part/3-chapter/meta.md', ...chapter },
      { id: '1-part/1-chapter/meta.md', ...chapter },
      { id: '1-part/2-chapter/meta.md', ...chapter },
    ]);

    const collection = await getTutorial();
    const chapters = collection.parts['1-part'].chapters;

    expect(chapters['1-chapter'].order).toBe(0);
    expect(chapters['2-chapter'].order).toBe(1);
    expect(chapters['3-chapter'].order).toBe(2);
  });

  test('chapters are ordered by metadata', async () => {
    getCollection.mockReturnValueOnce([
      { id: 'meta.md', ...tutorial },
      { id: '1-part/meta.md', ...part, data: { ...part.data, chapters: ['3-chapter', '1-chapter', '2-chapter'] } },
      { id: '1-part/1-chapter/meta.md', ...chapter },
      { id: '1-part/2-chapter/meta.md', ...chapter },
      { id: '1-part/3-chapter/meta.md', ...chapter },
    ]);

    const collection = await getTutorial();
    const chapters = collection.parts['1-part'].chapters;

    expect(chapters['3-chapter'].order).toBe(0);
    expect(chapters['1-chapter'].order).toBe(1);
    expect(chapters['2-chapter'].order).toBe(2);
  });

  test('chapters not mention in order are excluded ', async () => {
    vi.spyOn(logger, 'warn').mockImplementationOnce(vi.fn());

    getCollection.mockReturnValueOnce([
      { id: 'meta.md', ...tutorial },
      { id: '1-part/meta.md', ...part, data: { ...part.data, chapters: ['2-chapter', '1-chapter'] } },
      { id: '1-part/2-chapter/meta.md', ...chapter },
      { id: '1-part/excluded-chapter/meta.md', ...chapter },
      { id: '1-part/1-chapter/meta.md', ...chapter },
    ]);

    const collection = await getTutorial();
    const chapters = collection.parts['1-part'].chapters;

    expect(Object.keys(chapters)).toHaveLength(2);
    expect(chapters['excluded-part']).toBeUndefined();
    expect(chapters['1-chapter']).toBeDefined();
    expect(chapters['2-chapter']).toBeDefined();

    expect(vi.mocked(logger.warn).mock.calls[0][0]).toMatchInlineSnapshot(
      `"An order was specified for part '1-part' but chapter 'excluded-chapter' is not included, so it won't be visible."`,
    );
  });

  test('lessons are ordered by default', async () => {
    getCollection.mockReturnValueOnce([
      { id: 'meta.md', ...tutorial },
      { id: '1-part/meta.md', ...part },
      { id: '1-part/1-chapter/meta.md', ...chapter },
      { id: '1-part/1-chapter/2-lesson/meta.md', ...lesson },
      { id: '1-part/1-chapter/3-lesson/meta.md', ...lesson },
      { id: '1-part/1-chapter/1-lesson/meta.md', ...lesson },
    ]);

    const collection = await getTutorial();
    const lessons = collection.lessons;

    expect(lessons[0].order).toBe(0);
    expect(lessons[0].id).toBe('1-lesson');

    expect(lessons[1].order).toBe(1);
    expect(lessons[1].id).toBe('2-lesson');

    expect(lessons[2].order).toBe(2);
    expect(lessons[2].id).toBe('3-lesson');
  });

  test('lessons are ordered by metadata', async () => {
    getCollection.mockReturnValueOnce([
      { id: 'meta.md', ...tutorial },
      { id: '1-part/meta.md', ...part },
      {
        id: '1-part/1-chapter/meta.md',
        ...chapter,
        data: {
          ...chapter.data,
          lessons: ['3-lesson', '1-lesson', '2-lesson'],
        },
      },
      { id: '1-part/1-chapter/2-lesson/meta.md', ...lesson },
      { id: '1-part/1-chapter/3-lesson/meta.md', ...lesson },
      { id: '1-part/1-chapter/1-lesson/meta.md', ...lesson },
    ]);

    const collection = await getTutorial();
    const lessons = collection.lessons;

    expect(lessons[0].order).toBe(0);
    expect(lessons[0].id).toBe('3-lesson');

    expect(lessons[1].order).toBe(1);
    expect(lessons[1].id).toBe('1-lesson');

    expect(lessons[2].order).toBe(2);
    expect(lessons[2].id).toBe('2-lesson');
  });

  test('lessons not mention in order are excluded ', async () => {
    vi.spyOn(logger, 'warn').mockImplementationOnce(vi.fn());

    getCollection.mockReturnValueOnce([
      { id: 'meta.md', ...tutorial },
      { id: '1-part/meta.md', ...part },
      {
        id: '1-part/1-chapter/meta.md',
        ...chapter,
        data: { ...chapter.data, lessons: ['2-lesson', '1-lesson'] },
      },
      { id: '1-part/1-chapter/excluded-lesson/meta.md', ...lesson },
      { id: '1-part/1-chapter/1-lesson/meta.md', ...lesson },
      { id: '1-part/1-chapter/2-lesson/meta.md', ...lesson },
    ]);

    const collection = await getTutorial();
    const lessons = collection.lessons;

    expect(lessons).toHaveLength(2);
    expect(lessons[0].id).toBe('2-lesson');
    expect(lessons[1].id).toBe('1-lesson');

    expect(vi.mocked(logger.warn).mock.calls[0][0]).toMatchInlineSnapshot(
      `"An order was specified for chapter '1-chapter' but lesson 'excluded-lesson' is not included, so it won't be visible."`,
    );
  });
});

describe('missing parts', () => {
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
