import { describe, test, expect, beforeAll, vi, afterAll, beforeEach } from 'vitest';
import { LessonFilesFetcher } from './lesson-files.js';

const originalFetch = global.fetch;

let fetchBody: any;

const fetchSpy = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(fetchBody),
  }),
);

beforeAll(() => {
  global.fetch = fetchSpy as any;
});

beforeEach(() => {
  fetchSpy.mockClear();
});

afterAll(() => {
  global.fetch = originalFetch;
});

describe('LessonFilesFetcher', () => {
  test('getLessonTemplate should fetch template', async () => {
    fetchBody = { 'a.txt': 'content' };

    const fetcher = new LessonFilesFetcher();
    const files = await fetcher.getLessonTemplate({ data: { template: 'default' } } as any);

    expect(files).toEqual({ 'a.txt': 'content' });
    expect(fetchSpy).toHaveBeenCalledWith('/template-default.json', expect.anything());
  });

  test('getLessonTemplate should fetch at a different pathname if the fetcher is configured to use a different base', async () => {
    fetchBody = { 'a.txt': 'content' };

    const fetcher = new LessonFilesFetcher('/foo');
    const files = await fetcher.getLessonTemplate({ data: { template: 'default' } } as any);

    expect(files).toEqual({ 'a.txt': 'content' });
    expect(fetchSpy).toHaveBeenCalledWith('/foo/template-default.json', expect.anything());
  });

  test('getLessonFiles should fetch files', async () => {
    fetchBody = { 'a.txt': 'content' };

    const fetcher = new LessonFilesFetcher();
    const files = await fetcher.getLessonFiles({
      files: ['1-welcome-1-intro-1-welcome-files.json', ['a.txt']],
    } as any);

    expect(files).toEqual({ 'a.txt': 'content' });
    expect(fetchSpy).toHaveBeenCalledWith('/1-welcome-1-intro-1-welcome-files.json');
  });

  test('getLessonSolution should fetch solution', async () => {
    fetchBody = { 'a.txt': 'content' };

    const fetcher = new LessonFilesFetcher();
    const files = await fetcher.getLessonSolution({
      solution: ['1-welcome-1-intro-1-welcome-solution.json', ['a.txt']],
    } as any);

    expect(files).toEqual({ 'a.txt': 'content' });
    expect(fetchSpy).toHaveBeenCalledWith('/1-welcome-1-intro-1-welcome-solution.json');
  });

  test('invalidate should return none if files are not in map', async () => {
    const fetcher = new LessonFilesFetcher();
    const result = await fetcher.invalidate('1-welcome-1-intro-1-welcome-files.json');

    expect(result).toEqual({ type: 'none' });
  });

  test('invalidate should fetch files', async () => {
    fetchBody = { 'a.txt': 'content' };

    const fetcher = new LessonFilesFetcher();

    const initialData = await fetcher.getLessonFiles({
      files: ['1-welcome-1-intro-1-welcome-files.json', ['a.txt']],
    } as any);

    expect(initialData).toEqual({ 'a.txt': 'content' });

    fetchBody = { 'a.txt': 'foobar' };

    const result = await fetcher.invalidate('1-welcome-1-intro-1-welcome-files.json');

    expect(result).toEqual({ type: 'files', files: { 'a.txt': 'foobar' } });
    expect(fetchSpy).toHaveBeenCalledWith('/1-welcome-1-intro-1-welcome-files.json');
  });
});
