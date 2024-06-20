import { describe, it, expect } from 'vitest';
import { partSchema } from './part.js';

describe('partSchema', () => {
  it('should validate a valid part object', () => {
    expect(() =>
      partSchema.parse({
        title: 'Part 1',
        type: 'part',
        slug: 'part-one',
      }),
    ).not.toThrow();
  });

  it('should validate a part object without optional properties', () => {
    expect(() =>
      partSchema.parse({
        title: 'Part 1',
        type: 'part',
      }),
    ).not.toThrow();
  });

  it('should throw an error for a part object with invalid type', () => {
    expect(() =>
      partSchema.parse({
        title: 'Part 1',
        type: 'invalid',
      }),
    ).toThrow();
  });

  it('should throw an error for a part object with missing type property', () => {
    expect(() =>
      partSchema.parse({
        title: 'Part 1',
      }),
    ).toThrow();
  });
});
