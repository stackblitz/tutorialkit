import type { ChapterSchema, LessonSchema, PartSchema } from '../schemas/index.js';

export type * from './nav.js';

export type Files = Record<string, string | Uint8Array>;

export type FilesRef = [folder: string, files: string[]];

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
  files: FilesRef;
  solution: FilesRef;
  next?: LessonLink;
  prev?: LessonLink;

  // property available when content is generated for an astro project
  Markdown: T;
}

export type Tutorial = Record<string, Part>;
