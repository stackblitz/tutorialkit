export function joinPaths(baseURL: string, ...paths: string[]): string {
  let result = baseURL;

  for (const subpath of paths) {
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
