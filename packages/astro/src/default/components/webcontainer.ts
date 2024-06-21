import { useAuth } from './setup.js';
import { auth, WebContainer } from '@webcontainer/api';
import { TutorialStore, safeBoot, webContainerBootStatus } from '@tutorialkit/runtime';

interface WebContainerContext {
  readonly useAuth: boolean;
  loggedIn: () => Promise<void>;
  loaded: boolean;
}

export let webcontainer: Promise<WebContainer> = new Promise(() => {});

if (!import.meta.env.SSR) {
  webcontainer = Promise.resolve(useAuth ? auth.loggedIn() : null).then(() => safeBoot({ workdirName: 'tutorial' }));

  webcontainer.then(() => {
    webcontainerContext.loaded = true;
  });
}

export const tutorialStore = new TutorialStore({ webcontainer, useAuth });

export async function login() {
  auth.startAuthFlow({ popup: true });

  await auth.loggedIn();
}

export function logout() {
  auth.logout({ ignoreRevokeError: true });
}

export function forceBoot() {
  webContainerBootStatus().unblock();
}

export const webcontainerContext: WebContainerContext = {
  useAuth,
  loggedIn: () => auth.loggedIn(),
  loaded: false,
};
