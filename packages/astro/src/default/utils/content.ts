import path from 'node:path';
import type {
  Chapter,
  ChapterSchema,
  Lesson,
  LessonSchema,
  Part,
  PartSchema,
  Tutorial,
  TutorialSchema,
} from '@tutorialkit/types';
import { interpolateString, DEFAULT_LOCALIZATION } from '@tutorialkit/types';
import { getCollection } from 'astro:content';
import { getFilesRefList } from './content/files-ref';
import { squash } from './content/squash.js';
import { logger } from './logger';
import { joinPaths } from './url';

export async function getTutorial(): Promise<Tutorial> {
  const collection = sortCollection(await getCollection('tutorial'));

  const { tutorial, tutorialMetaData } = await parseCollection(collection);
  assertTutorialStructure(tutorial);
  sortTutorialLessons(tutorial, tutorialMetaData);

  // find orphans discard them and print warnings
  for (const partId in tutorial.parts) {
    const part = tutorial.parts[partId];

    if (part.order === -1) {
      delete tutorial.parts[partId];
      logger.warn(
        `An order was specified for the parts of the tutorial but '${partId}' is not included so it won't be visible.`,
      );
      continue;
    }

    for (const chapterId in part.chapters) {
      const chapter = part.chapters[chapterId];

      if (chapter.order === -1) {
        delete part.chapters[chapterId];
        logger.warn(
          `An order was specified for part '${partId}' but chapter '${chapterId}' is not included, so it won't be visible.`,
        );
        continue;
      }

      const chapterLessons = tutorial.lessons.filter((l) => l.chapter?.id === chapterId && l.part?.id === partId);

      for (const lesson of chapterLessons) {
        if (lesson.order === -1) {
          logger.warn(
            `An order was specified for chapter '${chapterId}' but lesson '${lesson.id}' is not included, so it won't be visible.`,
          );
          continue;
        }
      }
    }
  }

  // removed orphaned lessons
  tutorial.lessons = tutorial.lessons.filter((lesson) => lesson.order > -1);

  const baseURL = import.meta.env.BASE_URL;

  // now we link all lessons together and apply metadata inheritance
  for (const [i, lesson] of tutorial.lessons.entries()) {
    const prevLesson = i > 0 ? tutorial.lessons.at(i - 1) : undefined;
    const nextLesson = tutorial.lessons.at(i + 1);

    // order for metadata: lesson <- chapter (optional) <- part (optional) <- tutorial
    const sources: (Lesson['data'] | Chapter['data'] | Part['data'] | TutorialSchema)[] = [lesson.data];

    if (lesson.part && lesson.chapter) {
      sources.push(tutorial.parts[lesson.part.id].chapters[lesson.chapter.id].data);
    }

    if (lesson.part) {
      sources.push(tutorial.parts[lesson.part.id].data);
    }

    sources.push(tutorialMetaData);

    lesson.data = {
      ...lesson.data,
      ...squash(sources, [
        'mainCommand',
        'prepareCommands',
        'previews',
        'autoReload',
        'template',
        'terminal',
        'editor',
        'focus',
        'i18n',
        'meta',
        'editPageLink',
        'openInStackBlitz',
        'downloadAsZip',
        'filesystem',
      ]),
    };

    if (prevLesson) {
      const partSlug = prevLesson.part && tutorial.parts[prevLesson.part.id].slug;
      const chapterSlug =
        prevLesson.part &&
        prevLesson.chapter &&
        tutorial.parts[prevLesson.part.id].chapters[prevLesson.chapter.id].slug;

      const slug = [partSlug, chapterSlug, prevLesson.slug].filter(Boolean).join('/');

      lesson.prev = {
        title: prevLesson.data.title,
        href: joinPaths(baseURL, `/${slug}`),
      };
    }

    if (nextLesson) {
      const partSlug = nextLesson.part && tutorial.parts[nextLesson.part.id].slug;
      const chapterSlug =
        nextLesson.part &&
        nextLesson.chapter &&
        tutorial.parts[nextLesson.part.id].chapters[nextLesson.chapter.id].slug;

      const slug = [partSlug, chapterSlug, nextLesson.slug].filter(Boolean).join('/');

      lesson.next = {
        title: nextLesson.data.title,
        href: joinPaths(baseURL, `/${slug}`),
      };
    }

    if (lesson.data.editPageLink && typeof lesson.data.editPageLink === 'string') {
      lesson.editPageLink = interpolateString(lesson.data.editPageLink, { path: lesson.filepath });
    }
  }

  return tutorial;
}

async function parseCollection(collection: CollectionEntryTutorial[]) {
  const tutorial: Tutorial = {
    parts: {},
    lessons: [],
  };

  let tutorialMetaData: TutorialSchema | undefined;

  for (const entry of collection) {
    const { id, data } = entry;
    const { type } = data;

    const { partId, chapterId, lessonId } = resolveIds(id, type);

    if (type === 'tutorial') {
      tutorialMetaData = data;

      // default template if not specified
      tutorialMetaData.template ??= 'default';
      tutorialMetaData.i18n = Object.assign({ ...DEFAULT_LOCALIZATION }, tutorialMetaData.i18n);
      tutorialMetaData.openInStackBlitz ??= true;
      tutorialMetaData.downloadAsZip ??= false;

      tutorial.logoLink = data.logoLink;
    } else if (type === 'part') {
      if (!partId) {
        throw new Error('Part missing id');
      }

      tutorial.parts[partId] = {
        id: partId,
        order: -1,
        data,
        slug: getSlug(entry),
        chapters: {},
      };
    } else if (type === 'chapter') {
      if (!chapterId || !partId) {
        throw new Error(`Chapter missing ids: [${partId || null}, ${chapterId || null}]`);
      }

      if (!tutorial.parts[partId]) {
        throw new Error(`Could not find part '${partId}'`);
      }

      tutorial.parts[partId].chapters[chapterId] = {
        id: chapterId,
        order: -1,
        data,
        slug: getSlug(entry),
      };
    } else if (type === 'lesson') {
      if (!lessonId) {
        throw new Error('Lesson missing id');
      }

      const { Content } = await entry.render();

      const lessonDir = path.dirname(entry.id);
      const filesDir = path.join(lessonDir, '_files');
      const solutionDir = path.join(lessonDir, '_solution');

      const files = await getFilesRefList(filesDir);
      const solution = await getFilesRefList(solutionDir);

      const lesson: Lesson = {
        data,
        id: lessonId,
        filepath: id,
        order: -1,
        Markdown: Content,
        slug: getSlug(entry),
        files,
        solution,
      };

      if (partId) {
        if (!tutorial.parts[partId]) {
          throw new Error(`Could not find part '${partId}'`);
        }

        lesson.part = {
          id: partId,
          title: tutorial.parts[partId].data.title,
        };
      }

      if (partId && chapterId) {
        if (!tutorial.parts[partId].chapters[chapterId]) {
          throw new Error(`Could not find chapter '${chapterId}'`);
        }

        lesson.chapter = {
          id: chapterId,
          title: tutorial.parts[partId].chapters[chapterId].data.title,
        };
      }

      tutorial.lessons.push(lesson);
    }
  }

  if (!tutorialMetaData) {
    throw new Error(`Could not find tutorial 'meta.md' file`);
  }

  return { tutorial, tutorialMetaData };
}

function getOrder(
  order: string[] | undefined,
  fallbackSourceForOrder: Record<string, Part | Chapter> | Lesson['id'][],
): string[] {
  if (order) {
    return order;
  }

  const keys = Array.isArray(fallbackSourceForOrder)
    ? [...fallbackSourceForOrder]
    : Object.keys(fallbackSourceForOrder);

  // default to an order based on having each folder prefixed by their order: `1-foo`, `2-bar`, etc.
  return keys.sort((a, b) => {
    const numA = parseInt(a, 10);
    const numB = parseInt(b, 10);

    return numA - numB;
  });
}

function sortCollection(collection: CollectionEntryTutorial[]) {
  return collection.sort((a, b) => {
    const depthA = a.id.split('/').length;
    const depthB = b.id.split('/').length;

    return depthA - depthB;
  });
}

function getSlug(entry: CollectionEntryTutorial) {
  let slug: string = entry.slug;

  if (entry.slug.includes('/')) {
    const parts = entry.slug.split('/');
    const _slug = parts.at(-2);

    if (!_slug) {
      throw new Error('Invalid slug');
    }

    slug = _slug;
  }

  return slug;
}

function resolveIds(
  id: string,
  type: CollectionEntryTutorial['data']['type'],
): { partId?: string; chapterId?: string; lessonId?: string } {
  const parts = id.split('/');

  if (type === 'tutorial') {
    return {};
  }

  if (type === 'part') {
    return {
      partId: parts[0],
    };
  }

  if (type === 'chapter') {
    return {
      partId: parts[0],
      chapterId: parts[1],
    };
  }

  /**
   * Supported schemes for lessons are are:
   * - 'lesson-id/content.md'
   * - 'part-id/lesson-id/content.md'
   * - 'part-id/chapter-id/lesson-id/content.md'
   */
  if (parts.length === 2) {
    return {
      lessonId: parts[0],
    };
  }

  if (parts.length === 3) {
    return {
      partId: parts[0],
      lessonId: parts[1],
    };
  }

  return {
    partId: parts[0],
    chapterId: parts[1],
    lessonId: parts[2],
  };
}

function assertTutorialStructure(tutorial: Tutorial) {
  // verify that parts and lessons are not mixed in tutorial
  if (Object.keys(tutorial.parts).length !== 0 && tutorial.lessons.some((lesson) => !lesson.part)) {
    throw new Error(
      'Cannot mix lessons and parts in a tutorial. Either remove the parts or move root level lessons into a part.',
    );
  }

  // verify that chapters and lessons are not mixed in a single part
  for (const part of Object.values(tutorial.parts)) {
    if (Object.keys(part.chapters).length === 0) {
      continue;
    }

    if (tutorial.lessons.some((lesson) => lesson.part?.id === part.id && !lesson.chapter)) {
      throw new Error(
        `Cannot mix lessons and chapters in a part. Either remove the chapter from ${part.id} or move the lessons into a chapter.`,
      );
    }
  }
}

function sortTutorialLessons(tutorial: Tutorial, metadata: TutorialSchema) {
  const lessonIds = tutorial.lessons.map((lesson) => lesson.id);

  // lesson ID alone does not make a lesson unique - combination of lessonId + chapterId + partId does
  const lessonOrder: { lessonId: Lesson['id']; chapterId?: Chapter['id']; partId?: Part['id'] }[] = [];

  const lessonsInRoot = Object.keys(tutorial.parts).length === 0;

  // if lessons in root, sort by tutorial.lessons and metadata.lessons
  if (lessonsInRoot) {
    lessonOrder.push(...getOrder(metadata.lessons, lessonIds).map((lessonId) => ({ lessonId })));
  }

  // if no lessons in root, sort by parts and their possible chapters
  if (!lessonsInRoot) {
    for (const [partOrder, partId] of getOrder(metadata.parts, tutorial.parts).entries()) {
      const part = tutorial.parts[partId];

      if (!part) {
        continue;
      }

      part.order = partOrder;

      const partLessons = tutorial.lessons
        .filter((lesson) => lesson.chapter == null && lesson.part?.id === partId)
        .map((lesson) => lesson.id);

      // all lessons are in part, no chapters
      if (partLessons.length) {
        lessonOrder.push(...getOrder(part.data.lessons, partLessons).map((lessonId) => ({ lessonId, partId })));
        continue;
      }

      // lessons in chapters
      for (const [chapterOrder, chapterId] of getOrder(part.data.chapters, part.chapters).entries()) {
        const chapter = part.chapters[chapterId];

        if (!chapter) {
          continue;
        }

        chapter.order = chapterOrder;

        const chapterLessons = tutorial.lessons
          .filter((lesson) => lesson.chapter?.id === chapter.id && lesson.part?.id === partId)
          .map((lesson) => lesson.id);

        const chapterLessonOrder = getOrder(chapter.data.lessons, chapterLessons);

        lessonOrder.push(...chapterLessonOrder.map((lessonId) => ({ lessonId, partId, chapterId })));
      }
    }
  }

  // finally apply overall order for lessons
  for (const lesson of tutorial.lessons) {
    lesson.order = lessonOrder.findIndex(
      (l) => l.lessonId === lesson.id && l.chapterId === lesson.chapter?.id && l.partId === lesson.part?.id,
    );
  }

  tutorial.lessons.sort((a, b) => a.order - b.order);
}

export interface CollectionEntryTutorial {
  id: string;
  slug: string;
  body: string;
  collection: 'tutorial';
  data: TutorialSchema | PartSchema | ChapterSchema | LessonSchema;
  render(): Promise<{
    Content: import('astro').MarkdownInstance<Record<any, any>>['Content'];
    headings: import('astro').MarkdownHeading[];
    remarkPluginFrontmatter: Record<string, any>;
  }>;
}
