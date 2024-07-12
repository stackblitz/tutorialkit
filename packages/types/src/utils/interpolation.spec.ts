import { describe, it, expect } from 'vitest';
import { interpolateString } from './interpolation.js';

describe('interpolateString', () => {
  it('should interpolate variables', () => {
    const template = 'Hello, ${name}!';
    const variables = { name: 'world' };

    expect(interpolateString(template, variables)).toBe('Hello, world!');
  });

  it('should interpolate variables inside URL', () => {
    const template =
      'https://github.com/stackblitz/tutorialkit/blob/main/packages/template/src/content/tutorial/${path}?plain=1';
    const variables = { path: '1-basics/2-foo/1-welcome/content.md' };

    expect(interpolateString(template, variables)).toBe(
      'https://github.com/stackblitz/tutorialkit/blob/main/packages/template/src/content/tutorial/1-basics/2-foo/1-welcome/content.md?plain=1',
    );
  });

  it('should interpolate multiple variables', () => {
    const template = 'Part ${index}: ${title}';
    const variables = { index: 5, title: 'Welcome to foo bar' };

    expect(interpolateString(template, variables)).toBe('Part 5: Welcome to foo bar');
  });
});
