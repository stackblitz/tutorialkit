import type { ChapterSchema, LessonSchema, PartSchema } from '@schemas';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import { type ContentEntryMap } from 'astro:content';

export type TutorialCollection = ContentEntryMap['tutorial'];
export type CollectionEntry = TutorialCollection[keyof TutorialCollection];

export type Files = Record<string, string>;

export interface LessonLink {
  href: string;
  data: LessonSchema;
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
  files: Files;
  solution: Files;
  template: Files;
  next?: LessonLink;
  prev?: LessonLink;
  Markdown: AstroComponentFactory;
}

export type Tutorial = Record<string, Part>;
