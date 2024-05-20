/**
 * Simulates a single tick of the event loop.
 *
 * @returns A promise that resolves after the tick.
 */
export function tick() {
  return new Promise((resolve) => {
    setTimeout(resolve);
  });
}
