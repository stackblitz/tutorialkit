import { defaultHighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { Compartment, type Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { transitionTheme } from '@tutorialkit/theme';
import '../../styles/cm.css';
import type { Theme } from '../types.js';
import { vscodeDarkTheme } from './themes/vscode-dark.js';

export const darkTheme = EditorView.theme({}, { dark: true });
export const themeSelection = new Compartment();

export const editorTheme = EditorView.theme({
  '&.cm-editor': {
    height: '100%',
    background: 'var(--cm-backgroundColor)',
    color: 'var(--cm-textColor)',
    ...transitionTheme,
  },
  '.cm-cursor': {
    borderLeft: 'var(--cm-cursor-width) solid var(--cm-cursor-backgroundColor)',
  },
  '.cm-scroller': {
    lineHeight: '1.5',
  },
  '.cm-line': {
    padding: '0 0 0 4px',
  },
  '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground': {
    backgroundColor: 'var(--cm-selection-backgroundColorFocused)',
    opacity: 'var(--cm-selection-backgroundOpacityFocused, 0.3)',
    ...transitionTheme,
  },
  '&:not(.cm-focused) > .cm-scroller > .cm-selectionLayer .cm-selectionBackground': {
    backgroundColor: 'var(--cm-selection-backgroundColorBlured)',
    opacity: 'var(--cm-selection-backgroundOpacityBlured, 0.3)',
    ...transitionTheme,
  },
  '&.cm-focused > .cm-scroller .cm-matchingBracket': {
    backgroundColor: 'var(--cm-matching-bracket)',
  },
  '.cm-activeLine': {
    background: 'var(--cm-activeLineBackgroundColor)',
    ...transitionTheme,
  },
  '.cm-gutters': {
    background: 'var(--cm-gutter-backgroundColor)',
    borderRight: 0,
    color: 'var(--cm-gutter-textColor)',
    ...transitionTheme,
  },
  '.cm-gutter': {
    '&.cm-lineNumbers': {
      fontFamily: 'Roboto Mono, monospace',
      fontSize: '13px',
      minWidth: '28px',
    },
    '& .cm-activeLineGutter': {
      background: 'transparent',
      color: 'var(--cm-gutter-activeLineTextColor)',
    },
    '&.cm-foldGutter .cm-gutterElement > .fold-icon': {
      cursor: 'pointer',
      color: 'var(--cm-foldGutter-textColor)',
      transform: 'translateY(2px)',
      '&:hover': {
        color: 'var(--cm-foldGutter-textColorHover)',
      },
    },
  },
  '.cm-foldGutter .cm-gutterElement': {
    padding: '0 4px',
  },
  '.cm-tooltip-autocomplete > ul > li': {
    minHeight: '18px',
  },
  '.cm-panel.cm-search label': {
    marginLeft: '2px',
  },
  '.cm-panel.cm-search input[type=checkbox]': {
    position: 'relative',
    transform: 'translateY(2px)',
    marginRight: '4px',
  },
  '.cm-panels': {
    borderColor: 'var(--cm-panels-borderColor)',
  },
  '.cm-panel.cm-search': {
    background: 'var(--cm-search-backgroundColor)',
    color: 'var(--cm-search-textColor)',
    padding: '6px 8px',
    ...transitionTheme,
  },
  '.cm-search .cm-button': {
    background: 'var(--cm-search-button-backgroundColor)',
    borderColor: 'var(--cm-search-button-borderColor)',
    color: 'var(--cm-search-button-textColor)',
    borderRadius: '4px',
    '&:hover': {
      color: 'var(--cm-search-button-textColorHover)',
    },
    '&:focus-visible': {
      outline: 'none',
      borderColor: 'var(--cm-search-button-borderColorFocused)',
    },
    '&:hover:not(:focus-visible)': {
      background: 'var(--cm-search-button-backgroundColorHover)',
      borderColor: 'var(--cm-search-button-borderColorHover)',
    },
    '&:hover:focus-visible': {
      background: 'var(--cm-search-button-backgroundColorHover)',
      borderColor: 'var(--cm-search-button-borderColorFocused)',
    },
    ...transitionTheme,
  },
  '.cm-panel.cm-search [name=close]': {
    top: '6px',
    right: '6px',
    padding: '0 6px',
    backgroundColor: 'var(--cm-search-closeButton-backgroundColor)',
    color: 'var(--cm-search-closeButton-textColor)',
    '&:hover': {
      'border-radius': '6px',
      color: 'var(--cm-search-closeButton-textColorHover)',
      backgroundColor: 'var(--cm-search-closeButton-backgroundColorHover)',
      ...transitionTheme,
    },
    ...transitionTheme,
  },
  '.cm-search input': {
    background: 'var(--cm-search-input-backgroundColor)',
    borderColor: 'var(--cm-search-input-borderColor)',
    outline: 'none',
    borderRadius: '4px',
    '&:focus-visible': {
      borderColor: 'var(--cm-search-input-borderColorFocused)',
      ...transitionTheme,
    },
  },
  '.cm-tooltip': {
    background: 'var(--cm-tooltip-backgroundColor)',
    borderColor: 'var(--cm-tooltip-borderColor)',
    color: 'var(--cm-tooltip-textColor)',
  },
  '.cm-tooltip.cm-tooltip-autocomplete ul li[aria-selected]': {
    background: 'var(--cm-tooltip-backgroundColorSelected)',
    color: 'var(--cm-tooltip-textColorSelected)',
  },
});

export function getTheme(theme: Theme): Extension {
  return [editorTheme, theme === 'dark' ? themeSelection.of([getDarkTheme()]) : themeSelection.of([getLightTheme()])];
}

export function reconfigureTheme(theme: Theme) {
  return themeSelection.reconfigure(theme === 'dark' ? getDarkTheme() : getLightTheme());
}

function getLightTheme() {
  return syntaxHighlighting(defaultHighlightStyle);
}

function getDarkTheme() {
  return syntaxHighlighting(vscodeDarkTheme);
}
