// copy of built https://github.com/withastro/astro/blob/64f81e92d1ddd325f7f80508eb88590814c070a8/packages/astro/src/transitions/swap-functions.ts

/* eslint-disable */

/*
MIT License

Copyright (c) 2021 Fred K. Schott

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

"""
This license applies to parts of the `packages/create-astro` and `packages/astro` subdirectories originating from the https://github.com/sveltejs/kit repository:

Copyright (c) 2020 [these people](https://github.com/sveltejs/kit/graphs/contributors)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
"""

"""
This license applies to parts of the `packages/create-astro` and `packages/astro` subdirectories originating from the https://github.com/vitejs/vite repository:

MIT License

Copyright (c) 2019-present, Yuxi (Evan) You and Vite contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
"""
*/

const PERSIST_ATTR = 'data-astro-transition-persist';

function deselectScripts(doc) {
  for (const s1 of document.scripts) {
    for (const s2 of doc.scripts) {
      if (
        // Check if the script should be rerun regardless of it being the same
        !s2.hasAttribute('data-astro-rerun') && // Inline
        ((!s1.src && s1.textContent === s2.textContent) || // External
          (s1.src && s1.type === s2.type && s1.src === s2.src))
      ) {
        s2.dataset.astroExec = '';
        break;
      }
    }
  }
}

function swapRootAttributes(doc) {
  const html = document.documentElement;
  const astroAttributes = [...html.attributes].filter(
    ({ name }) => (html.removeAttribute(name), name.startsWith('data-astro-')),
  );
  [...doc.documentElement.attributes, ...astroAttributes].forEach(({ name, value }) => html.setAttribute(name, value));
}

function swapHeadElements(doc) {
  for (const el of Array.from(document.head.children)) {
    const newEl = persistedHeadElement(el, doc);

    if (newEl) {
      newEl.remove();
    } else {
      el.remove();
    }
  }
  document.head.append(...doc.head.children);
}

function swapBodyElement(newElement, oldElement) {
  oldElement.replaceWith(newElement);

  for (const el of oldElement.querySelectorAll(`[${PERSIST_ATTR}]`)) {
    const id = el.getAttribute(PERSIST_ATTR);
    const newEl = newElement.querySelector(`[${PERSIST_ATTR}="${id}"]`);

    if (newEl) {
      newEl.replaceWith(el);

      if (newEl.localName === 'astro-island' && shouldCopyProps(el)) {
        el.setAttribute('ssr', '');
        el.setAttribute('props', newEl.getAttribute('props'));
      }
    }
  }
}

const saveFocus = () => {
  const activeElement = document.activeElement;

  if (activeElement?.closest(`[${PERSIST_ATTR}]`)) {
    if (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement) {
      const start = activeElement.selectionStart;
      const end = activeElement.selectionEnd;

      return () => restoreFocus({ activeElement, start, end });
    }

    return () => restoreFocus({ activeElement });
  } else {
    return () => restoreFocus({ activeElement: null });
  }
};
const restoreFocus = ({ activeElement, start, end }) => {
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
};
const persistedHeadElement = (el, newDoc) => {
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
const shouldCopyProps = (el) => {
  const persistProps = el.dataset.astroTransitionPersistProps;
  return persistProps == null || persistProps === 'false';
};
const swap = (doc) => {
  deselectScripts(doc);
  swapRootAttributes(doc);
  swapHeadElements(doc);

  const restoreFocusFunction = saveFocus();
  swapBodyElement(doc.body, document.body);
  restoreFocusFunction();
};
export { deselectScripts, restoreFocus, saveFocus, swap, swapBodyElement, swapHeadElements, swapRootAttributes };
