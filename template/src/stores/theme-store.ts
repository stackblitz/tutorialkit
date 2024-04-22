import { atom } from 'nanostores';

type Theme = 'systemPreferred' | 'dark' | 'light';

export function prefersDarkTheme() {
  // we use `globalThis` because this also runs on the server side where `window` is undefined
  return 'matchMedia' in globalThis && globalThis.matchMedia('(prefers-color-scheme: dark)').matches;
}

export const themeStore = atom<Theme>('systemPreferred');
