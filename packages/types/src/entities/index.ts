import type { ChapterSchema, LessonSchema, PartSchema } from '../schemas/index.js';

export type * from './nav.js';

export type Files = Record<string, string | Uint8Array>;

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
  slug: string;
  data: PartSchema;
  chapters: Record<string, Chapter>;
}

export interface Chapter {
  id: string;
  slug: string;
  data: ChapterSchema;
  lessons: Record<string, Lesson>;
}

export interface Lesson<T = unknown> {
  id: string;
  data: LessonSchema;
  part: { id: string; title: string };
  chapter: { id: string; title: string };
  slug: string;
  files: FilesRefList;
  solution: FilesRefList;
  next?: LessonLink;
  prev?: LessonLink;

  // property available when content is generated for an astro project
  Markdown: T;
}

export interface Tutorial {
  logoLink?: string;
  parts: Record<string, Part>;
}
