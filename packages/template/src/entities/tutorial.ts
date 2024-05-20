import type { ChapterSchema, LessonSchema, PartSchema } from '@schemas';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import { type ContentEntryMap } from 'astro:content';

export type TutorialCollection = ContentEntryMap['tutorial'];
export type CollectionEntry = TutorialCollection[keyof TutorialCollection];

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
  Markdown: AstroComponentFactory;
}

export type Tutorial = Record<string, Part>;
