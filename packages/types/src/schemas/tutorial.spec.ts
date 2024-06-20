import { describe, it, expect } from 'vitest';
import { tutorialSchema } from '../schemas/tutorial.js';

describe('tutorialSchema', () => {
  it('should validate a valid tutorial object', () => {
    expect(() =>
      tutorialSchema.parse({
        type: 'tutorial',
        logoLink: 'https://example.com/logo.png',
      }),
    ).not.toThrow();
  });

  it('should validate a tutorial object without optional properties', () => {
    expect(() =>
      tutorialSchema.parse({
        type: 'tutorial',
      }),
    ).not.toThrow();
  });

  it('should throw an error for a tutorial object with invalid type', () => {
    expect(() =>
      tutorialSchema.parse({
        type: 'invalid',
      }),
    ).toThrow();
  });

  it('should throw an error for a tutorial object with invalid logoLink', () => {
    expect(() =>
      tutorialSchema.parse({
        type: 'tutorial',
        logoLink: 123,
      }),
    ).toThrow();
  });

  it('should throw an error for a tutorial object with missing type property', () => {
    expect(() =>
      tutorialSchema.parse({
        logoLink: 'https://example.com/logo.png',
      }),
    ).toThrow();
  });
});
