import type { PortListener, WebContainer } from '@webcontainer/api';
import { assert, expect, test } from 'vitest';
import { PreviewsStore } from './previews.js';

test("preview is set ready on webcontainer's event", async () => {
  const { store, emit } = await getStore();
  store.setPreviews([3000]);

  assert(store.previews.value);
  expect(store.previews.value[0].ready).toBe(false);

  emit(3000, 'open', 'https://localhost');

  expect(store.previews.value![0].ready).toBe(true);
});

test('preview is not set ready when different port is ready', async () => {
  const { store, emit } = await getStore();
  store.setPreviews([3000]);

  assert(store.previews.value);
  expect(store.previews.value[0].ready).toBe(false);

  emit(3001, 'open', 'https://localhost');

  expect(store.previews.value[0].ready).toBe(false);
});

test('marks multiple preview infos ready', async () => {
  const { store, emit } = await getStore();
  store.setPreviews([
    { port: 3000, title: 'Dev' },
    { port: 3000, title: 'Docs', pathname: '/docs' },
  ]);

  assert(store.previews.value);
  expect(store.previews.value).toHaveLength(2);

  expect(store.previews.value[0].ready).toBe(false);
  expect(store.previews.value[0].pathname).toBe(undefined);

  expect(store.previews.value[1].ready).toBe(false);
  expect(store.previews.value[1].pathname).toBe('/docs');

  emit(3000, 'open', 'https://localhost');

  expect(store.previews.value[0].ready).toBe(true);
  expect(store.previews.value[1].ready).toBe(true);
});

async function getStore() {
  const listeners: PortListener[] = [];

  const webcontainer: Pick<WebContainer, 'on'> = {
    on: (type, listener) => {
      if (type === 'port') {
        listeners.push(listener as PortListener);
      }

      return () => undefined;
    },
  };

  const promise = new Promise<WebContainer>((resolve) => {
    resolve(webcontainer as WebContainer);
  });

  await promise;

  return {
    store: new PreviewsStore(promise),
    emit: (...args: Parameters<PortListener>) => {
      assert(listeners.length > 0, 'Port listeners were not captured');

      listeners.forEach((cb) => cb(...args));
    },
  };
}
