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
 * @see https://github.com/withastro/astro/blob/main/packages/astro/src/transitions/router.ts
 */

const PERSIST_ATTR = 'data-astro-transition-persist';

function defaultSwap(beforeSwapEvent: TransitionBeforeSwapEvent) {
  /**
   * Swap attributes of the html element:
   *
   *  - Delete all attributes from the current document
   *  - Insert all attributes from doc
   *  - Reinsert all original attributes that are named 'data-astro-*'
   */
  const html = document.documentElement;

  const astroAttributes = [...html.attributes].filter(({ name }) => {
    return html.removeAttribute(name), name.startsWith('data-astro-');
  });

  [...beforeSwapEvent.newDocument.documentElement.attributes, ...astroAttributes].forEach(({ name, value }) =>
    html.setAttribute(name, value)
  );

  // replace scripts in both the head and body
  for (const s1 of document.scripts) {
    for (const s2 of beforeSwapEvent.newDocument.scripts) {
      const inline = !s1.src && s1.textContent === s2.textContent;
      const external = s1.src && s1.type === s2.type && s1.src === s2.src;

      if (
        // check if the script should be rerun regardless of it being the same
        !s2.hasAttribute('data-astro-rerun') &&
        (inline || external)
      ) {
        /**
         * The old script is in the new document and doesn't have the rerun attribute
         * we mark it as executed to prevent re-execution.
         */
        s2.dataset.astroExec = '';

        break;
      }
    }
  }

  // swap head
  for (const element of Array.from(document.head.children)) {
    const newElement = persistedHeadElement(element as HTMLElement, beforeSwapEvent.newDocument);
    /**
     * If the element exists in the document already, remove it
     * from the new document and leave the current node alone.
     */
    if (newElement) {
      newElement.remove();
    } else {
      // otherwise remove the element in the head, it doesn't exist in the new page
      element.remove();
    }
  }

  // everything left in the new head is new, append it all
  document.head.append(...beforeSwapEvent.newDocument.head.children);

  const savedFocus = saveFocus();

  /**
   * ==============================================================
   * INCOMING CHANGES COMPARED TO ORIGINAL VERSION
   * ==============================================================
   */

  // persist elements in the existing body
  const oldBody = document.body.querySelector('[data-swap-root]')!;

  // this will reset scroll Position
  document.body
    .querySelector('[data-swap-root]')!
    .replaceWith(beforeSwapEvent.newDocument.body.querySelector('[data-swap-root]')!);

  /**
   * ==============================================================
   * END OF CHANGES
   * ==============================================================
   */

  for (const element of oldBody.querySelectorAll(`[${PERSIST_ATTR}]`)) {
    const id = element.getAttribute(PERSIST_ATTR);
    const newElement = document.querySelector(`[${PERSIST_ATTR}="${id}"]`);

    if (newElement) {
      /**
       * The element exists in the new page, replace it with the element
       * from the old page so that state is preserved.
       */
      newElement.replaceWith(element);

      // for islands, copy over the props to allow them to re-render
      if (newElement.localName === 'astro-island' && shouldCopyProps(element as HTMLElement)) {
        element.setAttribute('ssr', '');
        element.setAttribute('props', newElement.getAttribute('props')!);
      }
    }
  }

  restoreFocus(savedFocus);
}

/**
 * Check for a head element that should persist and returns it,
 * either because it has the data attribute or is a link element.
 *
 * Returns null if the element is not part of the new head, undefined if it should be left alone.
 */
function persistedHeadElement(element: HTMLElement, newDoc: Document): Element | null {
  const id = element.getAttribute(PERSIST_ATTR);
  const newElement = id && newDoc.head.querySelector(`[${PERSIST_ATTR}="${id}"]`);

  if (newElement) {
    return newElement;
  }

  if (element.matches('link[rel=stylesheet]')) {
    const href = element.getAttribute('href');
    return newDoc.head.querySelector(`link[rel=stylesheet][href="${href}"]`);
  }

  return null;
}

type SavedFocus = {
  activeElement: HTMLElement | null;
  start?: number | null;
  end?: number | null;
};

function saveFocus(): SavedFocus {
  const activeElement = document.activeElement as HTMLElement;

  /**
   * The element that currently has the focus is part of a DOM tree
   * that will survive the transition to the new document.
   * Save the element and the cursor position
   */
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
}

function restoreFocus({ activeElement, start, end }: SavedFocus) {
  if (activeElement) {
    activeElement.focus();

    if (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement) {
      if (typeof start === 'number') {
        activeElement.selectionStart = start;
      }

      if (typeof end === 'number') {
        activeElement.selectionEnd = end;
      }
    }
  }
}

function shouldCopyProps(el: HTMLElement): boolean {
  const persistProps = el.dataset.astroTransitionPersistProps;
  return persistProps == null || persistProps === 'false';
}
