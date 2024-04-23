interface WithResolvers<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: any) => void;
}

export function withResolvers<T>(): WithResolvers<T> {
  let resolve!: (value: T) => void;
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

export interface Task<T> {
  promise: Promise<T>;
  cancel(): void;
}

export class AbortError extends Error {}

/**
 * A helper function to easily create "cancellable" promises where
 * once a promise is cancelled it is stopped and will never resolve.
 *
 * @param task A function that return a promise
 * @returns The newly created task
 */
export function newTask<T>(task: (abortSignal: AbortSignal) => Promise<T>): Task<T> {
  const abortController = new AbortController();

  return {
    promise: task(abortController.signal).catch((reason) => {
      if (!(reason instanceof AbortError)) {
        throw reason;
      }

      return new Promise<never>(() => {});
    }),
    cancel() {
      abortController.abort(new AbortError());
    },
  };
}
