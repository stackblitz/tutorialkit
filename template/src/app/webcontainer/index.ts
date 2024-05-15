import { authStore } from '@stores/auth-store';
import { useAuth } from './setup';
import { auth, WebContainer } from '@webcontainer/api';

interface WebContainerContext {
  useAuth: boolean;
  loggedIn: () => Promise<void>;
  loaded: boolean;
}

export let webcontainer: Promise<WebContainer> = new Promise(() => {});

if (!import.meta.env.SSR) {
  webcontainer = Promise.resolve(useAuth ? auth.loggedIn() : null).then(() =>
    WebContainer.boot({ workdirName: 'tutorial' }),
  );

  webcontainer.then(() => {
    webcontainerContext.loaded = true;
  });
}

export async function login() {
  auth.startAuthFlow({ popup: true });

  await auth.loggedIn();

  authStore.set({ status: 'authorized' });
}

export function logout() {
  auth.logout({ ignoreRevokeError: true });
}

export const webcontainerContext: WebContainerContext = {
  useAuth,
  loggedIn: () => auth.loggedIn(),
  loaded: false,
};

export function isWebContainerSupported() {
  const hasSharedArrayBuffer = 'SharedArrayBuffer' in window;
  const looksLikeChrome = navigator.userAgent.includes('Chrome');
  const looksLikeFirefox = navigator.userAgent.includes('Firefox');
  const looksLikeSafari = navigator.userAgent.includes('Safari');

  if (hasSharedArrayBuffer && (looksLikeChrome || looksLikeFirefox)) {
    return true;
  }

  if (hasSharedArrayBuffer && looksLikeSafari) {
    // we only support Safari 16.4 and up so we check for the version here
    const match = navigator.userAgent.match(/Version\/(\d+)\.(\d+) (?:Mobile\/.*?)?Safari/);
    const majorVersion = match ? Number(match?.[1]) : 0;
    const minorVersion = match ? Number(match?.[2]) : 0;

    return majorVersion > 16 || (majorVersion === 16 && minorVersion >= 4);
  }

  // Allow overriding the support check with localStorage.webcontainer_any_ua = 1
  try {
    return Boolean(localStorage.getItem('webcontainer_any_ua'));
  } catch {
    return false;
  }
}
