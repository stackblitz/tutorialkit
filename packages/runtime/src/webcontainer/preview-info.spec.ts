import { describe, it, expect } from 'vitest';
import { PreviewInfo } from './preview-info.js';

describe('PreviewInfo', () => {
  it('should accept a number for port', () => {
    const previewInfo = new PreviewInfo(3000);

    expect(previewInfo.port).toBe(3000);
    expect(previewInfo.title).toBe(undefined);
    expect(previewInfo.pathname).toBe(undefined);
  });

  it('should accept a string for port and pathname', () => {
    const previewInfo = new PreviewInfo('3000/some/nested/path');

    expect(previewInfo.port).toBe(3000);
    expect(previewInfo.pathname).toBe('some/nested/path');
    expect(previewInfo.title).toBe(undefined);
  });

  it('should accept a tuple of [port, title]', () => {
    const previewInfo = new PreviewInfo([3000, 'Local server']);

    expect(previewInfo.port).toBe(3000);
    expect(previewInfo.title).toBe('Local server');
    expect(previewInfo.pathname).toBe(undefined);
  });

  it('should accept a tuple of [port, title, pathname]', () => {
    const previewInfo = new PreviewInfo([3000, 'Local server', '/docs']);

    expect(previewInfo.port).toBe(3000);
    expect(previewInfo.title).toBe('Local server');
    expect(previewInfo.pathname).toBe('/docs');
  });

  it('should accept an object with { port, title }', () => {
    const previewInfo = new PreviewInfo({ port: 3000, title: 'Local server' });

    expect(previewInfo.port).toBe(3000);
    expect(previewInfo.title).toBe('Local server');
    expect(previewInfo.pathname).toBe(undefined);
  });

  it('should accept an object with { port, title, pathname }', () => {
    const previewInfo = new PreviewInfo({ port: 3000, title: 'Local server', pathname: '/docs' });

    expect(previewInfo.port).toBe(3000);
    expect(previewInfo.title).toBe('Local server');
    expect(previewInfo.pathname).toBe('/docs');
  });

  it('should not be ready by default', () => {
    const previewInfo = new PreviewInfo(3000);

    expect(previewInfo.ready).toBe(false);
  });

  it('should be ready if explicitly set', () => {
    const previewInfo = new PreviewInfo(3000, true);

    expect(previewInfo.ready).toBe(true);
  });

  it('should not be ready if explicitly set', () => {
    const previewInfo = new PreviewInfo(3000, false);

    expect(previewInfo.ready).toBe(false);
  });

  it('should have a url with a custom pathname and baseUrl', () => {
    const previewInfo = new PreviewInfo('3000/foo');
    previewInfo.baseUrl = 'https://example.com';

    expect(previewInfo.url).toBe('https://example.com/foo');
  });

  it('should be equal to another preview info with the same port and title', () => {
    const a = new PreviewInfo(3000);
    const b = new PreviewInfo(3000);

    expect(PreviewInfo.equals(a, b)).toBe(true);
  });

  it('should not be equal to another preview info with a different port', () => {
    const a = new PreviewInfo(3000);
    const b = new PreviewInfo(4000);

    expect(PreviewInfo.equals(a, b)).toBe(false);
  });

  it('should not be equal to another preview info with a different title', () => {
    const a = new PreviewInfo([3000, 'Local server']);
    const b = new PreviewInfo([3000, 'Remote server']);

    expect(PreviewInfo.equals(a, b)).toBe(false);
  });

  it('should not be equal to another preview info with a different pathname', () => {
    const a = new PreviewInfo(3000);
    const b = new PreviewInfo('3000/b');
    const c = new PreviewInfo('3000/c');

    expect(PreviewInfo.equals(a, b)).toBe(false);
    expect(PreviewInfo.equals(b, c)).toBe(false);
  });
});
