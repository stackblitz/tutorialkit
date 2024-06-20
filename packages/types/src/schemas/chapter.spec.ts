import { describe, it, expect } from 'vitest';
import { chapterSchema } from './chapter.js';

describe('chapterSchema', () => {
  it('should validate a valid chapter object', () => {
    expect(() =>
      chapterSchema.parse({
        title: 'Chapter 1',
        type: 'chapter',
        slug: 'chapter-one',
      }),
    ).not.toThrow();
  });

  it('should validate a chapter object without optional properties', () => {
    expect(() =>
      chapterSchema.parse({
        title: 'Chapter 1',
        type: 'chapter',
      }),
    ).not.toThrow();
  });

  it('should throw an error for a chapter object with invalid type', () => {
    expect(() =>
      chapterSchema.parse({
        title: 'Chapter 1',
        type: 'invalid',
      }),
    ).toThrow();
  });

  it('should throw an error for a chapter object with missing type property', () => {
    expect(() =>
      chapterSchema.parse({
        title: 'Chapter 1',
      }),
    ).toThrow();
  });
});
