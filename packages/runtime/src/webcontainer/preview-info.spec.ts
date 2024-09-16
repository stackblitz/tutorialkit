import { describe, it, expect } from 'vitest';
import { PortInfo } from './port-info.js';
import { PreviewInfo } from './preview-info.js';

describe('PreviewInfo', () => {
  it('should accept a number for port', () => {
    const previewInfo = PreviewInfo.parse(3000);

    expect(previewInfo.port).toBe(3000);
    expect(previewInfo.title).toBe(undefined);
    expect(previewInfo.pathname).toBe(undefined);
  });

  it('should accept a string for port and pathname', () => {
    const previewInfo = PreviewInfo.parse('3000/some/nested/path');

    expect(previewInfo.port).toBe(3000);
    expect(previewInfo.pathname).toBe('some/nested/path');
    expect(previewInfo.title).toBe(undefined);
  });

  it('should accept a tuple of [port, title]', () => {
    const previewInfo = PreviewInfo.parse([3000, 'Local server']);

    expect(previewInfo.port).toBe(3000);
    expect(previewInfo.title).toBe('Local server');
    expect(previewInfo.pathname).toBe(undefined);
  });

  it('should accept a tuple of [port, title, pathname]', () => {
    const previewInfo = PreviewInfo.parse([3000, 'Local server', '/docs']);

    expect(previewInfo.port).toBe(3000);
    expect(previewInfo.title).toBe('Local server');
    expect(previewInfo.pathname).toBe('/docs');
  });

  it('should accept an object with { port, title }', () => {
    const previewInfo = PreviewInfo.parse({ port: 3000, title: 'Local server' });

    expect(previewInfo.port).toBe(3000);
    expect(previewInfo.title).toBe('Local server');
    expect(previewInfo.pathname).toBe(undefined);
  });

  it('should accept an object with { port, title, pathname }', () => {
    const previewInfo = PreviewInfo.parse({ port: 3000, title: 'Local server', pathname: '/docs' });

    expect(previewInfo.port).toBe(3000);
    expect(previewInfo.title).toBe('Local server');
    expect(previewInfo.pathname).toBe('/docs');
  });

  it('should not be ready by default', () => {
    const previewInfo = new PreviewInfo({}, new PortInfo(3000));

    expect(previewInfo.ready).toBe(false);
  });

  it('should be ready if explicitly set', () => {
    const previewInfo = new PreviewInfo({}, new PortInfo(3000, undefined, true));

    expect(previewInfo.ready).toBe(true);
  });

  it('should not be ready if explicitly set', () => {
    const previewInfo = new PreviewInfo({}, new PortInfo(3000, undefined, false));

    expect(previewInfo.ready).toBe(false);
  });

  it('should have a url with a custom pathname and baseUrl', () => {
    const parsed = PreviewInfo.parse('3000/foo');
    const previewInfo = new PreviewInfo(parsed, new PortInfo(parsed.port));
    previewInfo.portInfo.origin = 'https://example.com';

    expect(previewInfo.url).toBe('https://example.com/foo');
  });

  it('should be equal to another preview info with the same port and title', () => {
    const a = new PreviewInfo({}, new PortInfo(3000));
    const b = new PreviewInfo({}, new PortInfo(3000));

    expect(PreviewInfo.equals(a, b)).toBe(true);
  });

  it('should not be equal to another preview info with a different port', () => {
    const a = new PreviewInfo({}, new PortInfo(3000));
    const b = new PreviewInfo({}, new PortInfo(4000));

    expect(PreviewInfo.equals(a, b)).toBe(false);
  });

  it('should not be equal to another preview info with a different title', () => {
    const parsed = {
      a: PreviewInfo.parse([3000, 'Local server']),
      b: PreviewInfo.parse([3000, 'Remote server']),
    };

    const a = new PreviewInfo(parsed.a, new PortInfo(parsed.a.port));
    const b = new PreviewInfo(parsed.b, new PortInfo(parsed.b.port));

    expect(PreviewInfo.equals(a, b)).toBe(false);
  });

  it('should not be equal to another preview info with a different pathname', () => {
    const parsed = {
      a: PreviewInfo.parse(3000),
      b: PreviewInfo.parse('3000/b'),
      c: PreviewInfo.parse('3000/c'),
    };

    const a = new PreviewInfo(parsed.a, new PortInfo(parsed.a.port));
    const b = new PreviewInfo(parsed.b, new PortInfo(parsed.b.port));
    const c = new PreviewInfo(parsed.c, new PortInfo(parsed.c.port));

    expect(PreviewInfo.equals(a, b)).toBe(false);
    expect(PreviewInfo.equals(b, c)).toBe(false);
  });
});
