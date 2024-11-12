import type { I18nSchema } from '../schemas/i18n.js';
import type { ChapterSchema, CustomSchema, LessonSchema, PartSchema } from '../schemas/index.js';
import type { MetaTagsSchema } from '../schemas/metatags.js';

export type * from './nav.js';

export type FileDescriptor = { path: string; type: 'file' | 'folder' };
export type Files = Record<string, string | Uint8Array>;

export type FilesystemError = 'FILE_EXISTS' | 'FOLDER_EXISTS';

/**
 * This tuple contains a "ref" which points to a file to fetch with the `LessonFilesFetcher` and
 * the list of file paths included by that ref.
 */
export type FilesRefList = [ref: string, files: string[]];

export interface LessonLink {
  href: string;
  title: string;
}

export interface Part {
  id: string;
  order: number;
  slug: string;
  data: PartSchema;
  firstChapterId?: string;
  chapters: Record<string, Chapter>;
}

export interface Chapter {
  id: string;
  order: number;
  slug: string;
  data: ChapterSchema;
  firstLessonId?: string;
  lessons: Record<string, Lesson>;
}

export interface Lesson<T = unknown> {
  id: string;
  order: number;
  data: LessonSchema;
  part: { id: string; title: string };
  chapter: { id: string; title: string };
  slug: string;

  // slug to pass to astro:content `getEntry`
  entrySlug: string;
  filepath: string;
  editPageLink?: string;
  files: FilesRefList;
  solution: FilesRefList;
  next?: LessonLink;
  prev?: LessonLink;

  // property available when content is generated for an astro project
  Markdown: T;
}

export type I18n = Required<NonNullable<I18nSchema>>;

export type MetaTagsConfig = MetaTagsSchema;

export type CustomConfig = CustomSchema;

export interface Tutorial {
  logoLink?: string;
  firstPartId?: string;
  parts: Record<string, Part>;
}
