/**
 * This code must be executed as soon as possible.
 */
import { auth } from '@webcontainer/api';
import { authStatusStore } from '@stores/auth-store';

const authConfig = __WC_CONFIG__;

export const useAuth = __ENTERPRISE__ && !!authConfig;

// this condition is here to make sure the branch is removed by esbuild if it evaluates to false
if (__ENTERPRISE__) {
  if (authConfig && !import.meta.env.SSR) {
    authStatusStore.set(auth.init(authConfig));

    auth.on('auth-failed', (reason) => authStatusStore.set({ status: 'auth-failed', ...reason }));
    auth.on('logged-out', () => authStatusStore.set({ status: 'need-auth' }));
  }
}
