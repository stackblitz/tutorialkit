export function newCommand<F extends (...args: any[]) => Promise<any>>(fn: F) {
  return async function (this: any, ...args: Parameters<F>): Promise<Awaited<ReturnType<F>> | undefined> {
    try {
      return await fn.apply(this, args);
    } catch (error: unknown) {
      if (error instanceof CancelError) {
        return undefined;
      }

      throw error;
    }
  };
}

export class CancelError extends Error {
  constructor() {
    super('operation cancelled');
  }
}
