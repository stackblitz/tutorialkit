import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { classNames } from '../utils/classnames.js';

const NODE_PADDING_LEFT = 12;
const DEFAULT_HIDDEN_FILES = [/\/node_modules\//];

interface Props {
  files: string[];
  selectedFile?: string;
  onFileSelect?: (filePath: string) => void;
  hideRoot: boolean;
  scope?: string;
  hiddenFiles?: Array<string | RegExp>;
  className?: string;
}

export function FileTree({ files, onFileSelect, selectedFile, hideRoot, scope, hiddenFiles, className }: Props) {
  const computedHiddenFiles = useMemo(() => [...DEFAULT_HIDDEN_FILES, ...(hiddenFiles ?? [])], [hiddenFiles]);

  const fileList = useMemo(
    () => buildFileList(files, hideRoot, scope, computedHiddenFiles),
    [files, hideRoot, scope, computedHiddenFiles],
  );

  const [collapsedFolders, setCollapsedFolders] = useState(() => new Set<number>());

  // reset collapsed folders when the list of files changes
  useEffect(() => {
    setCollapsedFolders(new Set<number>());
  }, [files]);

  const filteredFileList = useMemo(() => {
    const list = [];

    let lastDepth = Number.MAX_SAFE_INTEGER;

    for (const fileOrFolder of fileList) {
      const depth = fileOrFolder.depth;

      // if the depth is equal we reached the end of the collaped group
      if (lastDepth === depth) {
        lastDepth = Number.MAX_SAFE_INTEGER;
      }

      // ignore collapsed folders
      if (collapsedFolders.has(fileOrFolder.id)) {
        lastDepth = Math.min(lastDepth, depth);
      }

      // ignore files and folders below the last collapsed folder
      if (lastDepth < depth) {
        continue;
      }

      list.push(fileOrFolder);
    }

    return list;
  }, [fileList, collapsedFolders]);

  function toggleCollapseState(id: number) {
    setCollapsedFolders((prevSet) => {
      const newSet = new Set(prevSet);

      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }

      return newSet;
    });
  }

  return (
    <div className={classNames(className, 'transition-theme bg-tk-elements-fileTree-backgroundColor')}>
      {filteredFileList.map((fileOrFolder) => {
        switch (fileOrFolder.kind) {
          case 'file': {
            return (
              <File
                key={fileOrFolder.id}
                selected={selectedFile === fileOrFolder.fullPath}
                file={fileOrFolder}
                onClick={() => onFileSelect?.(fileOrFolder.fullPath)}
              />
            );
          }
          case 'folder': {
            return (
              <Folder
                key={fileOrFolder.id}
                folder={fileOrFolder}
                collapsed={collapsedFolders.has(fileOrFolder.id)}
                onClick={() => toggleCollapseState(fileOrFolder.id)}
              />
            );
          }
        }
      })}
    </div>
  );
}

export default FileTree;

interface FolderProps {
  folder: FolderNode;
  collapsed: boolean;
  onClick: () => void;
}

function Folder({ folder: { depth, name }, collapsed, onClick }: FolderProps) {
  return (
    <NodeButton
      className="group transition-theme bg-tk-elements-fileTree-folder-backgroundColor hover:bg-tk-elements-fileTree-folder-backgroundColorHover text-tk-elements-fileTree-folder-textColor hover:text-tk-elements-fileTree-folder-textColor"
      depth={depth}
      iconClasses={classNames(
        'text-tk-elements-fileTree-folder-iconColor group-hover:text-tk-elements-fileTree-folder-iconColorHover',
        {
          'i-ph-folder-simple-duotone': collapsed,
          'i-ph-folder-open-duotone': !collapsed,
        },
      )}
      onClick={onClick}
    >
      {name}
    </NodeButton>
  );
}

interface FileProps {
  file: FileNode;
  selected: boolean;
  onClick: () => void;
}

function File({ file: { depth, name }, onClick, selected }: FileProps) {
  return (
    <NodeButton
      className={classNames('group transition-theme', {
        'bg-tk-elements-fileTree-file-backgroundColor hover:bg-tk-elements-fileTree-file-backgroundColorHover text-tk-elements-fileTree-file-textColor hover:text-tk-elements-fileTree-file-textColorHover':
          !selected,
        'bg-tk-elements-fileTree-file-backgroundColorSelected text-tk-elements-fileTree-file-textColorSelected':
          selected,
      })}
      depth={depth}
      iconClasses={classNames('i-ph-file-duotone', {
        'text-tk-elements-fileTree-file-iconColor group-hover:text-tk-elements-fileTree-file-iconColorHover': !selected,
        'text-tk-elements-fileTree-file-iconColorSelected': selected,
      })}
      onClick={onClick}
      aria-pressed={selected}
    >
      {name}
    </NodeButton>
  );
}

interface ButtonProps {
  depth: number;
  iconClasses: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  'aria-pressed'?: boolean;
}

function NodeButton({ depth, iconClasses, onClick, className, 'aria-pressed': ariaPressed, children }: ButtonProps) {
  return (
    <button
      className={`flex items-center gap-2 w-full pr-2 border-2 border-transparent text-faded ${className ?? ''}`}
      style={{ paddingLeft: `${12 + depth * NODE_PADDING_LEFT}px` }}
      onClick={() => onClick?.()}
      aria-pressed={ariaPressed === true ? 'true' : undefined}
    >
      <div className={classNames('scale-120 shrink-0', iconClasses)}></div>
      <span>{children}</span>
    </button>
  );
}

type Node = FileNode | FolderNode;

interface BaseNode {
  id: number;
  depth: number;
  name: string;
}

interface FileNode extends BaseNode {
  kind: 'file';
  fullPath: string;
}

interface FolderNode extends BaseNode {
  kind: 'folder';
}

function buildFileList(
  files: string[],
  hideRoot: boolean,
  scope: string | undefined,
  hiddenFiles: Array<string | RegExp>,
): Node[] {
  const folderPaths = new Set<string>();
  const fileList: Node[] = [];
  const defaultDepth = hideRoot ? 0 : 1;

  if (!hideRoot) {
    fileList.push({ kind: 'folder', name: '/', depth: 0, id: 0 });
  }

  for (const filePath of files) {
    if (scope && !filePath.startsWith(scope)) {
      continue;
    }

    const segments = filePath.split('/').filter((s) => s);
    const fileName = segments.at(-1);

    if (!fileName || isHiddenFile(filePath, fileName, hiddenFiles)) {
      continue;
    }

    let currentPath = '';

    for (let depth = 0; depth < segments.length; ++depth) {
      const name = segments[depth];
      const fullPath = (currentPath += `/${name}`);

      if (depth === segments.length - 1) {
        fileList.push({
          kind: 'file',
          id: fileList.length,
          name,
          fullPath,
          depth: depth + defaultDepth,
        });
      } else if (!folderPaths.has(fullPath)) {
        folderPaths.add(fullPath);

        fileList.push({
          kind: 'folder',
          id: fileList.length,
          name,
          depth: depth + defaultDepth,
        });
      }
    }
  }

  return fileList;
}

function isHiddenFile(filePath: string, fileName: string, hiddenFiles: Array<string | RegExp>) {
  return hiddenFiles.some((pathOrRegex) => {
    if (typeof pathOrRegex === 'string') {
      return fileName === pathOrRegex;
    }

    return pathOrRegex.test(filePath);
  });
}
