import { defaultHighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { Compartment, type Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { themeIsDark } from '@stores/theme-store';
import '@styles/cm.css';

export const dummyDarkTheme = EditorView.theme({}, { dark: true });
export const themeSelection = new Compartment();

const codeHighlightStyle = defaultHighlightStyle;

export const editorTheme = EditorView.theme({
  '&.cm-editor': {
    height: '100%',
    background: 'var(--cm-bg)',
  },
  '.cm-cursor': {
    borderLeft: 'var(--cm-cursor-width) solid var(--cm-cursor-color)',
  },
  '.cm-scroller': {
    lineHeight: '1.5',
  },
  '.cm-line': {
    padding: '0 0 0 4px',
  },
  '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground': {
    backgroundColor: 'var(--cm-selection-bg)',
    opacity: '0.3',
  },
  '.cm-activeLine': {
    background: 'var(--cm-active-line)',
  },
  '.cm-gutters': {
    background: 'var(--cm-bg)',
    borderRight: 0,
    color: 'var(--cm-gutter-fg)',
  },
  '.cm-gutter': {
    '&.cm-lineNumbers': {
      minWidth: '28px',
    },
    '& .cm-activeLineGutter': {
      fontWeight: 600,
      background: 'transparent',
    },
    '&.cm-foldGutter .cm-gutterElement > .fold-icon': {
      cursor: 'pointer',
      transform: 'translateY(2px)',
    },
  },
  '.cm-foldGutter .cm-gutterElement': {
    padding: '0 4px',
  },
  '.cm-tooltip-autocomplete > ul > li': {
    minHeight: '18px',
  },
  '.cm-panel.cm-search label': {
    display: 'inline-flex',
    alignItems: 'align-items',
    '& input[type=checkbox]': {
      marginRight: '4px',
    },
  },
});

export function theme(): Extension {
  return [
    editorTheme,
    syntaxHighlighting(codeHighlightStyle, { fallback: true }),
    themeIsDark() ? themeSelection.of(dummyDarkTheme) : themeSelection.of([]),
  ];
}
