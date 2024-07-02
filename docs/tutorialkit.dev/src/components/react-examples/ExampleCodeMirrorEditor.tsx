import type { EditorDocument, EditorUpdate, ScrollPosition } from '@tutorialkit/components-react/core';
import CodeMirrorEditor from '@tutorialkit/components-react/core/CodeMirrorEditor';
import { useState } from 'react';
import { useTheme } from './hooks/useTheme';

export default function ExampleCodeMirrorEditor() {
  const { document, theme, onChange, onScroll } = useEditorDocument();

  return (
    <CodeMirrorEditor
      theme={theme}
      doc={document}
      onChange={onChange}
      onScroll={onScroll}
      debounceChange={500}
      debounceScroll={500}
      className="h-full text-sm"
    />
  );
}

function useEditorDocument() {
  const theme = useTheme();
  const [document, setDocument] = useState<EditorDocument>(DEFAULT_DOCUMENT);

  function onChange({ content }: EditorUpdate) {
    setDocument((prev) => ({
      ...prev,
      value: content,
    }));
  }

  function onScroll(scroll: ScrollPosition) {
    setDocument((prev) => ({
      ...prev,
      scroll,
    }));
  }

  return {
    theme,
    document,
    onChange,
    onScroll,
  };
}

const DEFAULT_DOCUMENT: EditorDocument = {
  filePath: 'index.js',
  loading: false,
  value: 'function hello() {\n  console.log("Hello, world!");\n}\n\nhello();',
};
