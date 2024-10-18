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
  chapters: Record<Chapter['id'], Chapter>;
}

export interface Chapter {
  id: string;
  order: number;
  slug: string;
  data: ChapterSchema;
}

export interface Lesson<T = unknown> {
  id: string;
  order: number;
  data: LessonSchema;
  part?: { id: Part['id']; title: string };
  chapter?: { id: Chapter['id']; title: string };
  slug: string;
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
  parts: Record<Part['id'], Part>;
  lessons: Lesson[];
}
