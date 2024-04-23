import { acceptCompletion, autocompletion, closeBrackets } from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { bracketMatching, foldGutter, indentOnInput, indentUnit } from '@codemirror/language';
import { searchKeymap } from '@codemirror/search';
import { Compartment, EditorState } from '@codemirror/state';
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
import { isTransitionBeforePreparationEvent, type TransitionBeforePreparationEvent } from 'astro:transitions/client';
import { useEffect, useRef, useState } from 'react';
import { theme } from './cm-theme';
import { indentKeyBinding } from './indent';
import { getLanguage } from './languages';

export interface EditorDocument {
  value: string;
  filePath: string;
}

interface Props {
  doc?: EditorDocument;
  onReady?: () => void;
}

export default function CodeMirrorEditor({ doc, onReady }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView>();
  const [language] = useState(new Compartment());

  useEffect(() => {
    if (!viewRef.current) {
      const editorState = EditorState.create({
        doc: '',
        extensions: [
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
          EditorView.domEventHandlers({
            keydown: (event) => {
              if (event.code === 'KeyS' && (event.ctrlKey || event.metaKey)) {
                event.preventDefault();
              }
            },
          }),
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

      document.addEventListener('astro:before-preparation', transitionBeforePreparation);

      onReady?.();

      setEditorDocument(view, language, doc);
    } else {
      const { current: view } = viewRef;

      setEditorDocument(view, language, doc);
    }
  }, [doc]);

  useEffect(() => {
    return () => {
      document.removeEventListener('astro:before-preparation', transitionBeforePreparation);
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

    return;
  }

  getLanguage(doc.filePath).then((languageSupport) => {
    if (!languageSupport) {
      return;
    }

    view.dispatch({
      effects: languageExtension.reconfigure([languageSupport]),
      selection: { anchor: 0 },
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: doc.value,
      },
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
