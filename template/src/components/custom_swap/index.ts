import type { TransitionBeforeSwapEvent } from 'astro:transitions/client';
import { TRANSITION_BEFORE_SWAP, isTransitionBeforeSwapEvent } from 'astro:transitions/client';

document.addEventListener(TRANSITION_BEFORE_SWAP, (event) => {
  if (isTransitionBeforeSwapEvent(event)) {
    event.swap = defaultSwap.bind(event, event);
  }
});

/**
 * Modified version of astro default's swap logic to preserve iframes.
 *
 * https://github.com/withastro/astro/blob/a10ed2a4cfd3a7385c2455895303e1db11aa662b/packages/astro/src/transitions/router.ts
 */

const PERSIST_ATTR = 'data-astro-transition-persist';

const defaultSwap = (beforeSwapEvent: TransitionBeforeSwapEvent) => {
  // swap attributes of the html element
  // - delete all attributes from the current document
  // - insert all attributes from doc
  // - reinsert all original attributes that are named 'data-astro-*'
  const html = document.documentElement;
  const astroAttributes = [...html.attributes].filter(
    ({ name }) => (html.removeAttribute(name), name.startsWith('data-astro-'))
  );
  [...beforeSwapEvent.newDocument.documentElement.attributes, ...astroAttributes].forEach(({ name, value }) =>
    html.setAttribute(name, value)
  );

  // Replace scripts in both the head and body.
  for (const s1 of document.scripts) {
    for (const s2 of beforeSwapEvent.newDocument.scripts) {
      if (
        // Check if the script should be rerun regardless of it being the same
        !s2.hasAttribute('data-astro-rerun') &&
        // Inline
        ((!s1.src && s1.textContent === s2.textContent) ||
          // External
          (s1.src && s1.type === s2.type && s1.src === s2.src))
      ) {
        // the old script is in the new document and doesn't have the rerun attribute
        // we mark it as executed to prevent re-execution
        s2.dataset.astroExec = '';
        break;
      }
    }
  }

  // Swap head
  for (const el of Array.from(document.head.children)) {
    const newEl = persistedHeadElement(el as HTMLElement, beforeSwapEvent.newDocument);
    // If the element exists in the document already, remove it
    // from the new document and leave the current node alone
    if (newEl) {
      newEl.remove();
    } else {
      // Otherwise remove the element in the head. It doesn't exist in the new page.
      el.remove();
    }
  }

  // Everything left in the new head is new, append it all.
  document.head.append(...beforeSwapEvent.newDocument.head.children);

  const savedFocus = saveFocus();

  /**
   * ====================================================================
   *            INCOMING CHANGES COMPARED TO ORIGINAL VERSION
   * ====================================================================
   */

  // Persist elements in the existing body
  const oldBody = document.body.querySelector('[data-swap-root]')!;

  // this will reset scroll Position
  document.body
    .querySelector('[data-swap-root]')!
    .replaceWith(beforeSwapEvent.newDocument.body.querySelector('[data-swap-root]')!);

  /**
   * ====================================================================
   *                         END OF CHANGES
   * ====================================================================
   */

  for (const el of oldBody.querySelectorAll(`[${PERSIST_ATTR}]`)) {
    const id = el.getAttribute(PERSIST_ATTR);
    const newEl = document.querySelector(`[${PERSIST_ATTR}="${id}"]`);
    if (newEl) {
      // The element exists in the new page, replace it with the element
      // from the old page so that state is preserved.
      newEl.replaceWith(el);
      // For islands, copy over the props to allow them to re-render
      if (newEl.localName === 'astro-island' && shouldCopyProps(el as HTMLElement)) {
        el.setAttribute('ssr', '');
        el.setAttribute('props', newEl.getAttribute('props')!);
      }
    }
  }
  restoreFocus(savedFocus);
};

// Check for a head element that should persist and returns it,
// either because it has the data attribute or is a link el.
// Returns null if the element is not part of the new head, undefined if it should be left alone.
const persistedHeadElement = (el: HTMLElement, newDoc: Document): Element | null => {
  const id = el.getAttribute(PERSIST_ATTR);
  const newEl = id && newDoc.head.querySelector(`[${PERSIST_ATTR}="${id}"]`);
  if (newEl) {
    return newEl;
  }
  if (el.matches('link[rel=stylesheet]')) {
    const href = el.getAttribute('href');
    return newDoc.head.querySelector(`link[rel=stylesheet][href="${href}"]`);
  }
  return null;
};

type SavedFocus = {
  activeElement: HTMLElement | null;
  start?: number | null;
  end?: number | null;
};

const saveFocus = (): SavedFocus => {
  const activeElement = document.activeElement as HTMLElement;
  // The element that currently has the focus is part of a DOM tree
  // that will survive the transition to the new document.
  // Save the element and the cursor position
  if (activeElement?.closest(`[${PERSIST_ATTR}]`)) {
    if (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement) {
      const start = activeElement.selectionStart;
      const end = activeElement.selectionEnd;
      return { activeElement, start, end };
    }
    return { activeElement };
  } else {
    return { activeElement: null };
  }
};

const restoreFocus = ({ activeElement, start, end }: SavedFocus) => {
  if (activeElement) {
    activeElement.focus();
    if (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement) {
      if (typeof start === 'number') activeElement.selectionStart = start;
      if (typeof end === 'number') activeElement.selectionEnd = end;
    }
  }
};

const shouldCopyProps = (el: HTMLElement): boolean => {
  const persistProps = el.dataset.astroTransitionPersistProps;
  return persistProps == null || persistProps === 'false';
};
