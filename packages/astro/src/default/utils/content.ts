import type {
  ChapterSchema,
  FilesRefList,
  Lesson,
  LessonSchema,
  PartSchema,
  Tutorial,
  TutorialSchema,
} from '@tutorialkit/types';
import { folderPathToFilesRef } from '@tutorialkit/types';
import { getCollection } from 'astro:content';
import glob from 'fast-glob';
import path from 'node:path';
import { IGNORED_FILES } from './constants';
import { squash } from './content/squash.js';
import { logger } from './logger';
import { joinPaths } from './url';

const CONTENT_DIR = path.join(process.cwd(), 'src/content/tutorial');

export async function getTutorial(): Promise<Tutorial> {
  const collection = sortCollection(await getCollection('tutorial'));

  const _tutorial: Tutorial = {
    parts: {},
  };

  let tutorialMetaData: TutorialSchema | undefined;
  let lessons: Lesson[] = [];

  for (const entry of collection) {
    const { id, data } = entry;
    const { type } = data;

    const [partId, chapterId, lessonId] = id.split('/');

    if (type === 'tutorial') {
      tutorialMetaData = data;

      // default template if not specified
      tutorialMetaData.template ??= 'default';
      tutorialMetaData.i18n = Object.assign(
        {
          partTemplate: 'Part ${index}: ${title}',
          noPreviewNorStepsText: 'No preview to run nor steps to show',
          startWebContainerText: 'Run this tutorial',
        } satisfies Lesson['data']['i18n'],
        tutorialMetaData.i18n,
      );

      _tutorial.logoLink = data.logoLink;
    } else if (type === 'part') {
      _tutorial.parts[partId] = {
        id: partId,
        order: -1,
        data,
        slug: getSlug(entry),
        chapters: {},
      };
    } else if (type === 'chapter') {
      if (!_tutorial.parts[partId]) {
        throw new Error(`Could not find part '${partId}'`);
      }

      _tutorial.parts[partId].chapters[chapterId] = {
        id: chapterId,
        order: -1,
        data,
        slug: getSlug(entry),
        lessons: {},
      };
    } else if (type === 'lesson') {
      if (!_tutorial.parts[partId]) {
        throw new Error(`Could not find part '${partId}'`);
      }

      if (!_tutorial.parts[partId].chapters[chapterId]) {
        throw new Error(`Could not find chapter '${partId}'`);
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
        part: {
          id: partId,
          title: _tutorial.parts[partId].data.title,
        },
        chapter: {
          id: chapterId,
          title: _tutorial.parts[partId].chapters[chapterId].data.title,
        },
        Markdown: Content,
        slug: getSlug(entry),
        files,
        solution,
      };

      lessons.push(lesson);

      _tutorial.parts[partId].chapters[chapterId].lessons[lessonId] = lesson;
    }
  }

  if (!tutorialMetaData) {
    throw new Error(`Could not find tutorial 'meta.md' file`);
  }

  // let's now compute the order for everything
  const partsOrder = getOrder(tutorialMetaData.parts, _tutorial.parts);

  for (let p = 0; p < partsOrder.length; ++p) {
    const partId = partsOrder[p];
    const part = _tutorial.parts[partId];

    if (!part) {
      logger.warn(`Could not find '${partId}', it won't be part of the tutorial.`);
      continue;
    }

    if (!_tutorial.firstPartId) {
      _tutorial.firstPartId = partId;
    }

    part.order = p;

    const chapterOrder = getOrder(part.data.chapters, part.chapters);

    for (let c = 0; c < chapterOrder.length; ++c) {
      const chapterId = chapterOrder[c];
      const chapter = part.chapters[chapterId];

      if (!chapter) {
        logger.warn(`Could not find '${chapterId}', it won't be part of the part '${partId}'.`);
        continue;
      }

      if (!part.firstChapterId) {
        part.firstChapterId = chapterId;
      }

      chapter.order = c;

      const lessonOrder = getOrder(chapter.data.lessons, chapter.lessons);

      for (let l = 0; l < lessonOrder.length; ++l) {
        const lessonId = lessonOrder[l];
        const lesson = chapter.lessons[lessonId];

        if (!lesson) {
          logger.warn(`Could not find '${lessonId}', it won't be part of the chapter '${chapterId}'.`);
          continue;
        }

        if (!chapter.firstLessonId) {
          chapter.firstLessonId = lessonId;
        }

        lesson.order = l;
      }
    }
  }

  // removed orphaned lessons
  lessons = lessons.filter(
    (lesson) =>
      lesson.order !== -1 &&
      _tutorial.parts[lesson.part.id].order !== -1 &&
      _tutorial.parts[lesson.part.id].chapters[lesson.chapter.id].order !== -1,
  );

  // find orphans discard them and print warnings
  for (const partId in _tutorial.parts) {
    const part = _tutorial.parts[partId];

    if (part.order === -1) {
      delete _tutorial.parts[partId];
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

      for (const lessonId in chapter.lessons) {
        const lesson = chapter.lessons[lessonId];

        if (lesson.order === -1) {
          delete chapter.lessons[lessonId];
          logger.warn(
            `An order was specified for chapter '${chapterId}' but lesson '${lessonId}' is not included, so it won't be visible.`,
          );
          continue;
        }
      }
    }
  }

  // sort lessons
  lessons.sort((a, b) => {
    const partsA = [
      _tutorial.parts[a.part.id].order,
      _tutorial.parts[a.part.id].chapters[a.chapter.id].order,
      a.order,
    ] as const;
    const partsB = [
      _tutorial.parts[b.part.id].order,
      _tutorial.parts[b.part.id].chapters[b.chapter.id].order,
      b.order,
    ] as const;

    for (let i = 0; i < partsA.length; i++) {
      if (partsA[i] !== partsB[i]) {
        return partsA[i] - partsB[i];
      }
    }

    return 0;
  });

  const baseURL = import.meta.env.BASE_URL;

  // now we link all lessons together
  for (const [i, lesson] of lessons.entries()) {
    const prevLesson = i > 0 ? lessons.at(i - 1) : undefined;
    const nextLesson = lessons.at(i + 1);

    const partMetadata = _tutorial.parts[lesson.part.id].data;
    const chapterMetadata = _tutorial.parts[lesson.part.id].chapters[lesson.chapter.id].data;

    lesson.data = {
      ...lesson.data,
      ...squash(
        [lesson.data, chapterMetadata, partMetadata, tutorialMetaData],
        [
          'mainCommand',
          'prepareCommands',
          'previews',
          'autoReload',
          'template',
          'terminal',
          'editor',
          'focus',
          'i18n',
          'editPageLink',
        ],
      ),
    };

    if (prevLesson) {
      const partSlug = _tutorial.parts[prevLesson.part.id].slug;
      const chapterSlug = _tutorial.parts[prevLesson.part.id].chapters[prevLesson.chapter.id].slug;

      lesson.prev = {
        title: prevLesson.data.title,
        href: joinPaths(baseURL, `/${partSlug}/${chapterSlug}/${prevLesson.slug}`),
      };
    }

    if (nextLesson) {
      const partSlug = _tutorial.parts[nextLesson.part.id].slug;
      const chapterSlug = _tutorial.parts[nextLesson.part.id].chapters[nextLesson.chapter.id].slug;

      lesson.next = {
        title: nextLesson.data.title,
        href: joinPaths(baseURL, `/${partSlug}/${chapterSlug}/${nextLesson.slug}`),
      };
    }

    if (lesson.data.editPageLink && typeof lesson.data.editPageLink === 'string') {
      lesson.editPageLink = lesson.data.editPageLink.replace(':path', lesson.filepath);
    }
  }

  return _tutorial;
}

function getOrder(order: string[] | undefined, fallbackSourceForOrder: Record<string, any>): string[] {
  if (order) {
    return order;
  }

  // default to an order based on having each folder prefixed by their order: `1-foo`, `2-bar`, etc.
  return Object.keys(fallbackSourceForOrder).sort((a, b) => {
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

async function getFilesRefList(pathToFolder: string): Promise<FilesRefList> {
  const root = path.join(CONTENT_DIR, pathToFolder);

  const filePaths = (
    await glob(`${glob.convertPathToPattern(root)}/**/*`, {
      onlyFiles: true,
      ignore: IGNORED_FILES,
      dot: true,
    })
  ).map((filePath) => `/${path.relative(root, filePath)}`);

  filePaths.sort();

  const filesRef = folderPathToFilesRef(pathToFolder);

  return [filesRef, filePaths];
}

interface CollectionEntryTutorial {
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
