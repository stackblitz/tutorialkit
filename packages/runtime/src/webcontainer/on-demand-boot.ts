/**
 * Lightweight wrapper around WebContainer.boot
 * to only boot if there's no risk on crashing the browser.
 *
 * This typicall might happen on iOS.
 *
 * When iOS is detected, a call to `unblock()` is required
 * to move forward with the boot.
 */
import { WebContainer, type BootOptions } from '@webcontainer/api';
import { atom, type ReadableAtom } from 'nanostores';
import { withResolvers } from '../utils/promises.js';

export type BootStatus = 'unknown' | 'blocked' | 'booting' | 'booted';

const localBootStatus = atom<BootStatus>('unknown');
const blockingStatus = withResolvers<void>();

export const bootStatus: ReadableAtom<BootStatus> = localBootStatus;

export async function safeBoot(options: BootOptions) {
  if (localBootStatus.get() === 'unknown') {
    localBootStatus.set(isRestricted() ? 'blocked' : 'booting');
  }

  if (localBootStatus.get() === 'blocked') {
    await blockingStatus.promise;

    localBootStatus.set('booting');
  }

  const webcontainer = await WebContainer.boot(options);

  localBootStatus.set('booted');

  return webcontainer;
}

export function unblockBoot() {
  if (localBootStatus.get() !== 'blocked') {
    return;
  }

  blockingStatus.resolve();
}

function isRestricted() {
  const { userAgent, maxTouchPoints, platform } = navigator;

  const iOS = /iPhone/.test(userAgent) || platform === 'iPhone';
  const iPadOS = (platform === 'MacIntel' && maxTouchPoints > 1) || platform === 'iPad';

  return iOS || iPadOS;
}
