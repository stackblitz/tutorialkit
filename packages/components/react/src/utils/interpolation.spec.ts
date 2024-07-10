import { describe, it, expect } from 'vitest';
import { interpolateString } from './interpolation.js';

describe('interpolateString', () => {
  it('should interpolate variables', () => {
    const template = 'Hello, ${name}!';
    const variables = { name: 'world' };

    expect(interpolateString(template, variables)).toBe('Hello, world!');
  });

  it('should interpolate multiple variables', () => {
    const template = 'Part ${index}: ${title}';
    const variables = { index: 5, title: 'Welcome to foo bar' };

    expect(interpolateString(template, variables)).toBe('Part 5: Welcome to foo bar');
  });
});
