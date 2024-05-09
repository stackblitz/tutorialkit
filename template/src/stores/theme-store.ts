import { atom } from 'nanostores';

export type Theme = 'dark' | 'light';

export const kTheme = 'tk_theme';

export function themeIsDark() {
  return themeStore.get() === 'dark';
}

export const themeStore = atom<Theme>(initStore());

function initStore() {
  if (!import.meta.env.SSR) {
    const themeAttribute = document.querySelector('html')?.getAttribute('data-theme');

    return (themeAttribute as Theme) ?? 'light';
  }

  return 'light';
}

export function toggleTheme() {
  const currentTheme = themeStore.get();
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  themeStore.set(newTheme);

  localStorage.setItem(kTheme, newTheme);

  document.querySelector('html')?.setAttribute('data-theme', newTheme);
}
