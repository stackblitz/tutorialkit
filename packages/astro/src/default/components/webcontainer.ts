// eslint-disable-next-line -- must be imported first
import { useAuth } from './setup.js';

import { safeBoot, TutorialStore } from '@tutorialkit/runtime';
import { auth, WebContainer } from '@webcontainer/api';
import { joinPaths } from '../utils/url.js';

interface WebContainerContext {
  readonly useAuth: boolean;
  loggedIn: () => Promise<void>;
  loaded: boolean;
}

export let webcontainer: Promise<WebContainer> = new Promise(() => {
  // noop for ssr
});

if (!import.meta.env.SSR) {
  webcontainer = Promise.resolve(useAuth ? auth.loggedIn() : null).then(() => safeBoot({ workdirName: 'tutorial' }));

  webcontainer.then(() => {
    webcontainerContext.loaded = true;
  });
}

export const tutorialStore = new TutorialStore({
  webcontainer,
  useAuth,
  basePathname: joinPaths(import.meta.env.BASE_URL, '/'),
});

export async function login() {
  auth.startAuthFlow({ popup: true });

  await auth.loggedIn();
}

export function logout() {
  auth.logout({ ignoreRevokeError: true });
}

export const webcontainerContext: WebContainerContext = {
  useAuth,
  loggedIn: () => auth.loggedIn(),
  loaded: false,
};
