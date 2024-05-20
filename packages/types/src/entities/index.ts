import type { ChapterSchema, LessonSchema, PartSchema } from '../schemas';

export type Files = Record<string, string>;

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

export interface Lesson {
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
  Markdown: unknown;
}

export type Tutorial = Record<string, Part>;
