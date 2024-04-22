import resizePanelStyles from '@styles/resize-panel.module.css';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import CodeMirrorEditor, { type EditorDocument } from '../CodeMirrorEditor/CodeMirrorEditor';

interface Props {
  showFileTree?: boolean;
  editorDocument?: EditorDocument;
  onEditorReady?: (value?: unknown) => void;
}

export default function EditorPanel({ showFileTree = true, editorDocument, onEditorReady }: Props) {
  return (
    <PanelGroup className={resizePanelStyles.PanelGroup} direction="horizontal">
      {showFileTree && (
        <Panel defaultSize={30} minSize={0}>
          File Tree
        </Panel>
      )}
      <PanelResizeHandle className={resizePanelStyles.PanelResizeHandle} hitAreaMargins={{ fine: 5, coarse: 5 }} />
      <Panel className="flex flex-col" defaultSize={70} minSize={10}>
        <div>{editorDocument && <FileTab editorDocument={editorDocument} />}</div>
        <div className="h-full flex-1 border-l border-panel-border overflow-hidden">
          <CodeMirrorEditor doc={editorDocument} onReady={onEditorReady} />
        </div>
      </Panel>
    </PanelGroup>
  );
}

interface FileTabProps {
  editorDocument: EditorDocument;
}

function FileTab({ editorDocument }: FileTabProps) {
  const renderFile = (filePath: string) => {
    const fileName = filePath.split('/').at(-1);

    if (!fileName) {
      console.error('Invalid file name');
      return null;
    }

    const icon = getFileIcon(fileName);

    return (
      <div className="flex items-center gap-2">
        <div className={icon ? `text-6 ${icon}` : ''}></div>
        <span className="text-3.5">{filePath}</span>
      </div>
    );
  };

  return (
    <div className="panel-header border-b border-l border-panel-border">{renderFile(editorDocument.filePath)}</div>
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
