import { describe, it, expect } from 'vitest';
import { contentSchema } from './content.js';

describe('contentSchema', () => {
  it('should validate a valid part', () => {
    expect(() =>
      contentSchema.parse({
        title: 'Part 1',
        type: 'part',
        slug: 'part-one',
      }),
    ).not.toThrow();
  });

  it('should validate an invalid part', () => {
    expect(() =>
      contentSchema.parse({
        type: 'part',
      }),
    ).toThrow();
  });

  it('should validate a valid chapter', () => {
    expect(() =>
      contentSchema.parse({
        type: 'chapter',
        title: 'Chapter 1',
      }),
    ).not.toThrow();
  });

  it('should validate an invalid chapter', () => {
    expect(() =>
      contentSchema.parse({
        type: 'chapter',
      }),
    ).toThrow();
  });

  it('should validate a valid lesson', () => {
    expect(() =>
      contentSchema.parse({
        type: 'lesson',
        title: 'Lesson 1',
      }),
    ).not.toThrow();
  });

  it('should validate an invalid lesson', () => {
    expect(() =>
      contentSchema.parse({
        type: 'lesson',
      }),
    ).toThrow();
  });
});
