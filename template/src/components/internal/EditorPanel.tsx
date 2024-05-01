import type { Lesson } from '@entities/tutorial';
import resizePanelStyles from '@styles/resize-panel.module.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle, type ImperativePanelHandle } from 'react-resizable-panels';
import {
  CodeMirrorEditor,
  type EditorDocument,
  type OnChangeCallback as OnEditorChange,
  type OnScrollCallback as OnEditorScroll,
} from '../CodeMirrorEditor/CodeMirrorEditor';
import { FileTree } from '../FileTree';

const DEFAULT_FILE_TREE_SIZE = 25;

interface Props {
  lesson: Lesson;
  showFileTree?: boolean;
  editorDocument?: EditorDocument;
  onEditorChange?: OnEditorChange;
  onEditorScroll?: OnEditorScroll;
  onFileClick?: (value?: string) => void;
}

export function EditorPanel({
  showFileTree = true,
  editorDocument,
  lesson,
  onEditorScroll,
  onEditorChange,
  onFileClick,
}: Props) {
  const fileTreePanelRef = useRef<ImperativePanelHandle>(null);
  const [selectedFile, setSelectedFile] = useState(lesson.data.focus);

  const onFileClickWrapped = useCallback(
    (fullPath: string) => {
      setSelectedFile(fullPath);
      onFileClick?.(fullPath);
    },
    [onFileClick],
  );

  // when the lesson changes we reset the selected file
  useEffect(() => {
    setSelectedFile(lesson.data.focus);
  }, [lesson]);

  useEffect(() => {
    const { current: fileTreePanel } = fileTreePanelRef;

    if (!fileTreePanel) {
      return;
    }

    if (showFileTree) {
      if (fileTreePanel.isCollapsed()) {
        fileTreePanel.resize(DEFAULT_FILE_TREE_SIZE);
      }
    } else if (!showFileTree) {
      fileTreePanel.collapse();
    }
  }, [lesson]);

  return (
    <PanelGroup className={resizePanelStyles.PanelGroup} direction="horizontal">
      <Panel collapsible defaultSize={0} minSize={10} ref={fileTreePanelRef}>
        <div className="panel-header border-r border-b border-panel-border">
          <div className="i-ph-tree-structure-duotone"></div>
          <span className="text-sm">Files</span>
        </div>
        <FileTree
          className="h-full py-2 border-r border-panel-border text-sm"
          selectedFile={selectedFile}
          hideRoot={lesson.data.hideRoot ?? true}
          files={lesson.files}
          scope={lesson.data.scope}
          onFileClick={onFileClickWrapped}
        />
      </Panel>
      <PanelResizeHandle
        disabled={!showFileTree}
        className={resizePanelStyles.PanelResizeHandle}
        hitAreaMargins={{ fine: 8, coarse: 8 }}
      />
      <Panel className="flex flex-col" defaultSize={100} minSize={10}>
        <FileTab editorDocument={editorDocument} />
        <div className="h-full flex-1 overflow-hidden">
          <CodeMirrorEditor reset={lesson} doc={editorDocument} onScroll={onEditorScroll} onChange={onEditorChange} />
        </div>
      </Panel>
    </PanelGroup>
  );
}

interface FileTabProps {
  editorDocument: EditorDocument | undefined;
}

function FileTab({ editorDocument }: FileTabProps) {
  const filePath = editorDocument?.filePath;
  const fileName = filePath?.split('/').at(-1) ?? '';
  const icon = fileName ? getFileIcon(fileName) : '';

  return (
    <div className="panel-header border-b border-panel-border">
      <div className="flex items-center gap-2">
        <div className={`scale-125 ${icon}`}></div>
        <span className="text-sm text-gray-600">{fileName}</span>
      </div>
    </div>
  );
}

function getFileIcon(fileName: string) {
  const extension = fileName.split('.').at(-1);

  if (!extension) {
    console.error('Cannot infer file type');
    return null;
  }

  switch (extension) {
    case 'ts': {
      return 'i-languages-ts?mask';
    }
    case 'cjs':
    case 'mjs':
    case 'js': {
      return 'i-languages-js?mask';
    }
    case 'html': {
      return 'i-languages-html?mask';
    }
    case 'css': {
      return 'i-languages-css?mask';
    }
    case 'scss':
    case 'sass': {
      return 'i-languages-sass?mask';
    }
    case 'md': {
      return 'i-languages-markdown?mask';
    }
    case 'json': {
      return 'i-languages-json?mask';
    }
    default: {
      return null;
    }
  }
}
