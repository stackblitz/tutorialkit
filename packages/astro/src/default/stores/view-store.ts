import { atom } from 'nanostores';

export type View = 'content' | 'editor';

export const viewStore = atom<View>('content');
