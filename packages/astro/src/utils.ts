export function withResolvers<T>(): PromiseWithResolvers<T> {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: any) => void;

  const promise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });

  return {
    resolve,
    reject,
    promise,
  };
}

export function normalizeImportPath(importPath: string): string {
  // this is a fix for windows where import path should still use forward slashes
  return importPath.replaceAll('\\', '/');
}
