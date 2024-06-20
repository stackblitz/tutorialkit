import { describe, it, expect } from 'vitest';
import { lessonSchema } from './lesson.js';

describe('lessonSchema', () => {
  it('should validate a valid lesson object', () => {
    expect(() =>
      lessonSchema.parse({
        title: 'Lesson 1',
        type: 'lesson',
        scope: 'math',
        hideRoot: true,
      }),
    ).not.toThrow();
  });

  it('should validate a lesson object without optional properties', () => {
    expect(() =>
      lessonSchema.parse({
        title: 'Lesson 1',
        type: 'lesson',
      }),
    ).not.toThrow();
  });

  it('should throw an error for a lesson object with invalid type', () => {
    expect(() =>
      lessonSchema.parse({
        title: 'Lesson 1',
        type: 'invalid',
      }),
    ).toThrow();
  });

  it('should throw an error for a lesson object with invalid scope', () => {
    expect(() =>
      lessonSchema.parse({
        title: 'Lesson 1',
        type: 'lesson',
        scope: 123,
      }),
    ).toThrow();
  });

  it('should throw an error for a lesson object with invalid hideRoot', () => {
    expect(() =>
      lessonSchema.parse({
        title: 'Lesson 1',
        type: 'lesson',
        hideRoot: 'true',
      }),
    ).toThrow();
  });

  it('should throw an error for a lesson object with missing type property', () => {
    expect(() =>
      lessonSchema.parse({
        title: 'Lesson 1',
        hideRoot: true,
      }),
    ).toThrow();
  });
});
