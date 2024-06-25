import { it, describe, expect } from 'vitest';
import { joinPaths } from './url';

describe('joinPaths', () => {
  it('should join paths', () => {
    expect(joinPaths('/a', 'b')).toBe('/a/b');
    expect(joinPaths('/a/', 'b')).toBe('/a/b');
    expect(joinPaths('/a', '/b')).toBe('/a/b');
    expect(joinPaths('/a/', '/b')).toBe('/a/b');
    expect(joinPaths('/', '/')).toBe('/');
  });

  it('should join multiple paths', () => {
    expect(joinPaths('/a', 'b', '/c')).toBe('/a/b/c');
    expect(joinPaths('/a', '/b', 'c')).toBe('/a/b/c');
    expect(joinPaths('/a/', '/b', '/c')).toBe('/a/b/c');
  });

  it('should join paths with empty strings', () => {
    expect(joinPaths('', 'b')).toBe('/b');
    expect(joinPaths('/a', '')).toBe('/a');
    expect(joinPaths('', '')).toBe('/');
  });

  it('should join paths with empty strings in the middle', () => {
    expect(joinPaths('/a', '', 'b')).toBe('/a/b');
    expect(joinPaths('/a', '', '', 'b')).toBe('/a/b');
  });

  it('should keep trailing slashes', () => {
    expect(joinPaths('/a/')).toBe('/a/');
    expect(joinPaths('/a/', 'b/')).toBe('/a/b/');
    expect(joinPaths('/a/', 'b/', '/c')).toBe('/a/b/c');
    expect(joinPaths('/a/', 'b/', '/c/')).toBe('/a/b/c/');
  });
});
