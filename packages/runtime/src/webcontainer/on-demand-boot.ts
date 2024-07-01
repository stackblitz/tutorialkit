/**
 * Lightweight wrapper around WebContainer.boot
 * to only boot if requested on iOS as typically
 * boot might risk the page to run out of memory.
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
