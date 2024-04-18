import type { ChapterSchema, LessonSchema, PartSchema } from '@schemas';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import { type ContentEntryMap } from 'astro:content';

export type TutorialCollection = ContentEntryMap['tutorial'];
export type CollectionEntry = TutorialCollection[keyof TutorialCollection];

export interface Part {
  slug: string;
  data: PartSchema;
  chapters: Record<string, Chapter>;
}

export interface Chapter {
  slug: string;
  data: ChapterSchema;
  lessons: Record<string, Lesson>;
}

export interface LessonLink {
  href: string;
  data: LessonSchema;
}

export interface Lesson {
  id: number;
  data: LessonSchema;
  part: number;
  chapter: number;
  slug: string;
  next?: LessonLink;
  prev?: LessonLink;
  Markdown: AstroComponentFactory;
}

export type Tutorial = Record<string, Part>;
