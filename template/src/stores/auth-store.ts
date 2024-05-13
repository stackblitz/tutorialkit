import type { AuthAPI } from '@webcontainer/api';
import { atom } from 'nanostores';

type AuthStatus = ReturnType<AuthAPI['init']> | { status: 'no-auth' };

export const authStatusStore = atom<AuthStatus>({ status: 'no-auth' });
