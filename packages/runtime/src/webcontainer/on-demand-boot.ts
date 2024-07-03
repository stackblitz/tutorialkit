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
import { withResolvers } from '../utils/promises.js';

let blocked: undefined | boolean;

const blockingStatus = withResolvers<void>();

export async function safeBoot(options: BootOptions) {
  if (typeof blocked === 'undefined') {
    blocked = isRestricted();
  }

  if (blocked) {
    await blockingStatus.promise;
  }

  return WebContainer.boot(options);
}

interface BootStatus {
  readonly blocked: boolean | undefined;
  unblock(): void;
}

export function webContainerBootStatus(): BootStatus {
  return {
    blocked,
    unblock() {
      if (blocked === false) {
        return;
      }

      blocked = false;
      blockingStatus.resolve();
    },
  };
}

function isRestricted() {
  const { userAgent, maxTouchPoints, platform } = navigator;

  const iOS = /iPhone/.test(userAgent) || platform === 'iPhone';
  const iPadOS = (platform === 'MacIntel' && maxTouchPoints > 1) || platform === 'iPad';

  return iOS || iPadOS;
}
