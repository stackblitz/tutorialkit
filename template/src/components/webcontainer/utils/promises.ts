interface WithResolvers<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: any) => void;
}

export function withResolvers<T>(): PromiseWithResolvers<T> {
  if (typeof Promise.withResolvers === 'function') {
    return Promise.withResolvers();
  }

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

export const kTaskCancelled = Symbol('kTaskCancelled');

export interface Task<T> {
  promise: Promise<T | typeof kTaskCancelled>;
  cancel(): void;
}

export class AbortError extends Error {}

/**
 * A helper function to easily create "cancellable" promises where
 * once a promise is cancelled it resolves to the "cancel" symbol.
 *
 * @param task - A function that return a promise.
 * @returns The newly created task.
 */
export function newTask<T>(task: (abortSignal: AbortSignal) => Promise<T>): Task<T> {
  const abortController = new AbortController();

  return {
    promise: task(abortController.signal).catch((reason) => {
      if (!(reason instanceof AbortError)) {
        throw reason;
      }

      return kTaskCancelled;
    }),
    cancel() {
      abortController.abort(new AbortError());
    },
  };
}
