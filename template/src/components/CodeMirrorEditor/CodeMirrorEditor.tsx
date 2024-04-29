import { acceptCompletion, autocompletion, closeBrackets } from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { bracketMatching, foldGutter, indentOnInput, indentUnit } from '@codemirror/language';
import { searchKeymap } from '@codemirror/search';
import { Compartment, EditorSelection, EditorState } from '@codemirror/state';
import {
  EditorView,
  ViewUpdate,
  drawSelection,
  dropCursor,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
  scrollPastEnd,
} from '@codemirror/view';
import { debounce } from '@utils/debounce';
import {
  TRANSITION_BEFORE_PREPARATION,
  isTransitionBeforePreparationEvent,
  type TransitionBeforePreparationEvent,
} from 'astro:transitions/client';
import { useEffect, useRef, useState } from 'react';
import { theme } from './cm-theme';
import { indentKeyBinding } from './indent';
import { getLanguage } from './languages';

export interface EditorDocument {
  value: string;
  filePath: string;
  scroll?: ScrollPosition;
  selection?: EditorSelection;
}

export interface ScrollPosition {
  top: number;
  left: number;
}

export type OnChangeCallback = (update: ViewUpdate) => void;
export type OnScrollCallback = (position: ScrollPosition) => void;

interface Props {
  doc?: EditorDocument;
  debounceChange?: number;
  debounceScroll?: number;
  onChange?: OnChangeCallback;
  onScroll?: OnScrollCallback;
  onReady?: () => void;
}

let id = 0;

export function CodeMirrorEditor({
  doc,
  debounceScroll = 100,
  debounceChange = 150,
  onReady,
  onScroll,
  onChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView>();
  const [language] = useState(new Compartment());
  const onScrollRef = useRef(onScroll);
  const onChangeRef = useRef(onChange);

  onScrollRef.current = onScroll;
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!viewRef.current) {
      const editorState = EditorState.create({
        doc: '',
        extensions: [
          EditorView.updateListener.of(
            debounce((update) => {
              onChangeRef.current?.(update);
            }, debounceChange),
          ),
          EditorView.domEventHandlers({
            scroll: debounce(() => {
              if (!viewRef.current) {
                return;
              }

              const { current: view } = viewRef;

              onScrollRef.current?.({ left: view.scrollDOM.scrollLeft, top: view.scrollDOM.scrollTop });
            }, debounceScroll),
            keydown: (event) => {
              if (event.code === 'KeyS' && (event.ctrlKey || event.metaKey)) {
                event.preventDefault();
              }
            },
          }),
          theme(),
          history(),
          keymap.of([
            ...defaultKeymap,
            ...historyKeymap,
            ...searchKeymap,
            { key: 'Tab', run: acceptCompletion },
            indentKeyBinding,
          ]),
          indentUnit.of('\t'),
          language.of([]),
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

              icon.className = `fold-icon ${open ? 'i-ph-caret-down' : 'i-ph-caret-right'}`;

              return icon;
            },
          }),
        ],
      });

      if (!containerRef.current) {
        console.error('Container reference undefined');
        return;
      }

      const view = new EditorView({
        state: editorState,
        parent: containerRef.current,
      });

      viewRef.current = view;

      // we grab the style tag that codemirror mounts
      const codemirrorStyleTag = document.head.children[0];
      codemirrorStyleTag.setAttribute('data-astro-transition-persist', 'codemirror');

      document.addEventListener(TRANSITION_BEFORE_PREPARATION, transitionBeforePreparation);

      onReady?.();

      setEditorDocument(view, language, doc);
    } else {
      const { current: view } = viewRef;

      setEditorDocument(view, language, doc);
    }
  }, [doc]);

  useEffect(() => {
    return () => {
      document.removeEventListener(TRANSITION_BEFORE_PREPARATION, transitionBeforePreparation);
      viewRef.current?.destroy();
      viewRef.current = undefined;
    };
  }, []);

  return <div className="h-full overflow-hidden" ref={containerRef} />;
}

CodeMirrorEditor.displayName = 'CodeMirrorEditor';

function setEditorDocument(view: EditorView, languageExtension: Compartment, doc?: EditorDocument) {
  if (!doc) {
    view.dispatch({
      selection: { anchor: 0 },
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: '',
      },
    });

    view.scrollDOM.scrollTo(0, 0);

    return;
  }

  getLanguage(doc.filePath).then((languageSupport) => {
    if (!languageSupport) {
      return;
    }

    view.dispatch({
      effects: [languageExtension.reconfigure([languageSupport])],
      selection: doc.selection ?? { anchor: 0 },
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: doc.value,
      },
    });

    requestAnimationFrame(() => {
      const currentLeft = view.scrollDOM.scrollLeft;
      const currentTop = view.scrollDOM.scrollTop;
      const newLeft = doc.scroll?.left ?? 0;
      const newTop = doc.scroll?.top ?? 0;

      const needsScrolling = currentLeft !== newLeft || currentTop !== newTop;

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

      view.scrollDOM.scrollTo(newLeft, newTop);
    });
  });
}

/**
 * Our options to for transitioning the style tag to the new DOM are limited so we have
 * to manually move the styles, otherwise they will just disappear because the editor
 * component is persisted and not re-mounted.
 */
function transitionBeforePreparation(event: TransitionBeforePreparationEvent) {
  if (isTransitionBeforePreparationEvent(event)) {
    const originalLoader = event.loader;

    event.loader = async () => {
      await originalLoader();

      const dummyStyleTag = document.createElement('style');
      dummyStyleTag.setAttribute('data-astro-transition-persist', 'codemirror');

      event.newDocument.head.insertAdjacentElement('afterbegin', dummyStyleTag);
    };
  }
}
