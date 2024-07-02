import { acceptCompletion, autocompletion, closeBrackets } from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { bracketMatching, foldGutter, indentOnInput, indentUnit } from '@codemirror/language';
import { searchKeymap } from '@codemirror/search';
import { Compartment, EditorSelection, EditorState, type Extension } from '@codemirror/state';
import {
  EditorView,
  drawSelection,
  dropCursor,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
  scrollPastEnd,
} from '@codemirror/view';
import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import { classNames } from '../../utils/classnames.js';
import { debounce } from '../../utils/debounce.js';
import type { Theme } from '../types.js';
import { BinaryContent } from './BinaryContent.js';
import { getTheme, reconfigureTheme } from './cm-theme.js';
import { indentKeyBinding } from './indent.js';
import { getLanguage } from './languages.js';

export interface EditorDocument {
  value: string | Uint8Array;
  loading: boolean;
  filePath: string;
  scroll?: ScrollPosition;
}

type TextEditorDocument = EditorDocument & {
  value: string;
};

export interface ScrollPosition {
  top: number;
  left: number;
}

export interface EditorUpdate {
  selection: EditorSelection;
  content: string;
}

export type OnChangeCallback = (update: EditorUpdate) => void;
export type OnScrollCallback = (position: ScrollPosition) => void;

interface Props {
  theme: Theme;
  id?: unknown;
  doc?: EditorDocument;
  debounceChange?: number;
  debounceScroll?: number;
  autoFocusOnDocumentChange?: boolean;
  onChange?: OnChangeCallback;
  onScroll?: OnScrollCallback;
  className?: string;
}

type EditorStates = Map<string, EditorState>;

export function CodeMirrorEditor({
  id,
  doc,
  debounceScroll = 100,
  debounceChange = 150,
  autoFocusOnDocumentChange = false,
  onScroll,
  onChange,
  theme,
  className = '',
}: Props) {
  const [language] = useState(new Compartment());
  const [readOnly] = useState(new Compartment());

  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView>();
  const themeRef = useRef<Theme>();
  const docRef = useRef<EditorDocument>();
  const editorStatesRef = useRef<EditorStates>();
  const onScrollRef = useRef(onScroll);
  const onChangeRef = useRef(onChange);

  const isBinaryFile = doc?.value instanceof Uint8Array;

  onScrollRef.current = onScroll;
  onChangeRef.current = onChange;
  docRef.current = doc;
  themeRef.current = theme;

  useEffect(() => {
    const onUpdate = debounce((update: EditorUpdate) => {
      onChangeRef.current?.(update);
    }, debounceChange);

    const view = new EditorView({
      parent: containerRef.current!,
      dispatchTransactions(transactions) {
        const previousSelection = view.state.selection;

        view.update(transactions);

        const newSelection = view.state.selection;

        const selectionChanged =
          newSelection !== previousSelection &&
          (newSelection === undefined || previousSelection === undefined || !newSelection.eq(previousSelection));

        if (
          docRef.current &&
          !docRef.current.loading &&
          (transactions.some((transaction) => transaction.docChanged) || selectionChanged)
        ) {
          onUpdate({
            selection: view.state.selection,
            content: view.state.doc.toString(),
          });

          editorStatesRef.current!.set(docRef.current.filePath, view.state);
        }
      },
    });

    viewRef.current = view;

    // we grab the style tag that codemirror mounts
    const codemirrorStyleTag = document.head.children[0];
    codemirrorStyleTag.setAttribute('data-astro-transition-persist', 'codemirror');

    return () => {
      viewRef.current?.destroy();
      viewRef.current = undefined;
    };
  }, []);

  useEffect(() => {
    if (!viewRef.current) {
      return;
    }

    viewRef.current.dispatch({
      effects: [reconfigureTheme(theme)],
    });
  }, [theme]);

  useEffect(() => {
    editorStatesRef.current = new Map<string, EditorState>();
  }, [id]);

  useEffect(() => {
    const editorStates = editorStatesRef.current!;
    const view = viewRef.current!;
    const theme = themeRef.current!;

    if (!doc) {
      setNoDocument(view);
      return;
    }

    if (doc.value instanceof Uint8Array) {
      return;
    }

    let state = editorStates.get(doc.filePath);

    if (!state) {
      state = newEditorState(doc.value, theme, onScrollRef, debounceScroll, [
        language.of([]),
        readOnly.of([EditorState.readOnly.of(doc.loading)]),
      ]);

      editorStates.set(doc.filePath, state);
    }

    view.setState(state);

    setEditorDocument(view, theme, language, readOnly, autoFocusOnDocumentChange, doc as TextEditorDocument);
  }, [doc?.value, doc?.filePath, doc?.loading]);

  return (
    <div className={classNames('relative', className)}>
      {isBinaryFile && <BinaryContent />}
      <div className="h-full overflow-hidden" ref={containerRef} />
    </div>
  );
}

export default CodeMirrorEditor;

CodeMirrorEditor.displayName = 'CodeMirrorEditor';

function newEditorState(
  content: string,
  theme: Theme,
  onScrollRef: MutableRefObject<OnScrollCallback | undefined>,
  debounceScroll: number,
  extensions: Extension[],
) {
  return EditorState.create({
    doc: content,
    extensions: [
      EditorView.domEventHandlers({
        scroll: debounce((_event, view) => {
          onScrollRef.current?.({ left: view.scrollDOM.scrollLeft, top: view.scrollDOM.scrollTop });
        }, debounceScroll),
        keydown: (event) => {
          if (event.code === 'KeyS' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
          }
        },
      }),
      getTheme(theme),
      history(),
      keymap.of([
        ...defaultKeymap,
        ...historyKeymap,
        ...searchKeymap,
        { key: 'Tab', run: acceptCompletion },
        indentKeyBinding,
      ]),
      indentUnit.of('\t'),
      autocompletion({
        closeOnBlur: false,
      }),
      closeBrackets(),
      lineNumbers(),
      scrollPastEnd(),
      dropCursor(),
      drawSelection(),
      bracketMatching(),
      EditorState.tabSize.of(2),
      indentOnInput(),
      highlightActiveLineGutter(),
      highlightActiveLine(),
      foldGutter({
        markerDOM: (open) => {
          const icon = document.createElement('div');

          icon.className = `fold-icon ${open ? 'i-ph-caret-down-bold' : 'i-ph-caret-right-bold'}`;

          return icon;
        },
      }),
      ...extensions,
    ],
  });
}

function setNoDocument(view: EditorView) {
  view.dispatch({
    selection: { anchor: 0 },
    changes: {
      from: 0,
      to: view.state.doc.length,
      insert: '',
    },
  });

  view.scrollDOM.scrollTo(0, 0);
}

function setEditorDocument(
  view: EditorView,
  theme: Theme,
  language: Compartment,
  readOnly: Compartment,
  autoFocus: boolean,
  doc: TextEditorDocument,
) {
  if (doc.value !== view.state.doc.toString()) {
    view.dispatch({
      selection: { anchor: 0 },
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: doc.value,
      },
    });
  }

  view.dispatch({
    effects: [readOnly.reconfigure([EditorState.readOnly.of(doc.loading)])],
  });

  getLanguage(doc.filePath).then((languageSupport) => {
    if (!languageSupport) {
      return;
    }

    view.dispatch({
      effects: [language.reconfigure([languageSupport]), reconfigureTheme(theme)],
    });

    requestAnimationFrame(() => {
      const currentLeft = view.scrollDOM.scrollLeft;
      const currentTop = view.scrollDOM.scrollTop;
      const newLeft = doc.scroll?.left ?? 0;
      const newTop = doc.scroll?.top ?? 0;

      const needsScrolling = currentLeft !== newLeft || currentTop !== newTop;

      if (autoFocus) {
        if (needsScrolling) {
          // we have to wait until the scroll position was changed before we can set the focus
          view.scrollDOM.addEventListener(
            'scroll',
            () => {
              view.focus();
            },
            { once: true },
          );
        } else {
          // if the scroll position is still the same we can focus immediately
          view.focus();
        }
      }

      view.scrollDOM.scrollTo(newLeft, newTop);
    });
  });
}
