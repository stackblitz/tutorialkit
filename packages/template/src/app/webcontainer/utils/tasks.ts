export const kTaskCancelled = Symbol('kTaskCancelled');

export type TaskCancelled = typeof kTaskCancelled;

export interface Task<T> {
  promise: Promise<T>;
  cancel(): void;
}

export class AbortError extends Error {}

interface NewTaskOptions {
  // if set to true then the promise resolves with the `kTaskCancelled` symbol
  ignoreCancel?: boolean;

  // an abort signal that this task will listen to and will abort if that signal trigger
  signal?: AbortSignal;
}

/**
 * A helper function to easily create "cancellable" promises where
 * once a promise is cancelled it resolves to the "cancel" symbol.
 *
 * @param task - A function that return a promise.
 * @returns The newly created task.
 */
export function newTask<T>(
  task: (abortSignal: AbortSignal) => Promise<T>,
  opts: { ignoreCancel: true; signal?: AbortSignal },
): Task<T | TaskCancelled>;
export function newTask<T>(task: (abortSignal: AbortSignal) => Promise<T>, opts?: { signal?: AbortSignal }): Task<T>;
export function newTask<T>(task: (abortSignal: AbortSignal) => Promise<T>, opts: NewTaskOptions = {}): Task<unknown> {
  const abortController = new AbortController();

  const abortListener = () => abortController.abort(new AbortError());
  const signal = opts.signal;

  let runningTask = task(abortController.signal);

  if (signal) {
    runningTask = runningTask.finally(() => signal.removeEventListener('abort', abortListener));
    signal.addEventListener('abort', abortListener, { once: true });
  }

  return {
    promise: !opts.ignoreCancel
      ? runningTask
      : runningTask.catch((reason) => {
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
