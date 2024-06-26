export function joinPaths(basePath: string, ...paths: string[]): string {
  let result = basePath || '/';

  for (const subpath of paths) {
    if (subpath.length === 0) {
      continue;
    }

    const resultEndsWithSlash = result.endsWith('/');
    const subpathStartsWithSlash = subpath.startsWith('/');

    if (resultEndsWithSlash && subpathStartsWithSlash) {
      result += subpath.slice(1);
    } else if (resultEndsWithSlash || subpathStartsWithSlash) {
      result += subpath;
    } else {
      result += `/${subpath}`;
    }
  }

  return result;
}
