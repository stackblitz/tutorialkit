import type { Lesson } from '@tutorialkit/types';
import { describe, it, test, expect } from 'vitest';
import { squash } from './squash.js';

type Metadata = Partial<Lesson['data']>;

describe('squash', () => {
  it('should squash objects together such that first occurences take precedence', () => {
    expect(squash([{ a: 1 }, { b: 2 }], ['a', 'b'])).toEqual({ a: 1, b: 2 });
    expect(squash([{ a: 1 }, { a: 2 }], ['a'])).toEqual({ a: 1 });
    expect(squash([{ c: 1 }, { c: 2 }, { a: 3 }], ['a'])).toEqual({ a: 3 });
  });

  it('should stop on the first value that is not an object', () => {
    expect(squash([{ a: 1 }, { a: { b: 2 } }], ['a'])).toEqual({ a: 1 });
    expect(squash([{ a: { b: 2 } }, { a: 1 }], ['a'])).toEqual({ a: { b: 2 } });
  });

  test('lesson with nothing and everything is in tutorial', () => {
    const tutorial = {
      data: { template: 'default', terminal: false },
    };
    const lesson1 = {
      data: {
        type: 'lesson' as const,
      },
    };

    expect(squash<Metadata>([lesson1.data, tutorial.data], ['terminal', 'template'])).toEqual({
      terminal: false,
      template: 'default',
    });
  });

  test('lesson with complex terminal config', () => {
    const tutorial = {
      data: {
        template: 'default',
        terminal: {
          panels: ['terminal', 'output'],
          activePanel: 0,
          allowCommands: ['ls', 'echo'],
        },
      } satisfies Metadata,
    };
    const lesson1 = {
      data: {
        type: 'lesson',
        terminal: {
          panels: ['terminal'],
        },
      } satisfies Metadata,
    };

    expect(squash<Metadata>([lesson1.data, tutorial.data], ['terminal', 'template'])).toEqual({
      terminal: {
        panels: ['terminal'],
        activePanel: 0,
        allowCommands: ['ls', 'echo'],
      },
      template: 'default',
    });
  });

  test('lesson with terminal config disabled', () => {
    const tutorial = {
      data: {
        template: 'default',
        terminal: {
          panels: ['terminal', 'output'],
          activePanel: 0,
          allowCommands: ['ls', 'echo'],
        },
      } satisfies Metadata,
    };
    const lesson1 = {
      data: {
        type: 'lesson',
        terminal: false,
      } satisfies Metadata,
    };

    expect(squash<Metadata>([lesson1.data, tutorial.data], ['terminal', 'template'])).toEqual({
      terminal: false,
      template: 'default',
    });
  });

  test('lesson and tutorial with i18n', () => {
    const tutorial = {
      data: {
        template: 'default',
        i18n: {
          startWebContainerText: 'Run this tutorial',
          partTemplate: 'Part ${index}: ${title}',
        },
      } satisfies Metadata,
    };
    const lesson1 = {
      data: {
        type: 'lesson',
        i18n: {
          partTemplate: 'Foobar: ${title}',
        },
      } satisfies Metadata,
    };

    expect(squash<Metadata>([lesson1.data, tutorial.data], ['i18n'])).toEqual({
      i18n: {
        startWebContainerText: 'Run this tutorial',
        partTemplate: 'Foobar: ${title}',
      },
    });
  });
});
