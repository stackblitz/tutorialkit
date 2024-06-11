/**
 * This code must be executed before WebContainer boots and be executed as soon as possible.
 * This ensures that when the authentication flow is complete in a popup, the popup is closed quickly.
 */
import { auth } from '@webcontainer/api';
import { authStore } from '../stores/auth-store.js';

const authConfig = __WC_CONFIG__;

export const useAuth = __ENTERPRISE__ && !!authConfig;

// this condition is here to make sure the branch is removed by esbuild if it evaluates to false
if (__ENTERPRISE__) {
  if (authConfig && !import.meta.env.SSR) {
    authStore.set(auth.init(authConfig));

    auth.on('auth-failed', (reason) => authStore.set({ status: 'auth-failed', ...reason }));
    auth.on('logged-out', () => authStore.set({ status: 'need-auth' }));
  }
}
