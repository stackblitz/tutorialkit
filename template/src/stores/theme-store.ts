import { atom } from 'nanostores';

type Theme = 'systemPreferred' | 'dark' | 'light';

export const themeStore = atom<Theme>('systemPreferred');
