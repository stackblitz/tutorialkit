import type { AuthAPI } from '@webcontainer/api';
import { atom } from 'nanostores';

type AuthStore = ReturnType<AuthAPI['init']> | { status: 'no-auth' };

export const authStore = atom<AuthStore>({ status: 'no-auth' });
