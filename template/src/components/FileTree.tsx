import type { Files } from '@entities/tutorial';
import { useEffect, useMemo, useState, type FC, type ReactNode } from 'react';

const NODE_PADDING_LEFT = 12;

interface Props {
  files: Files;
  selectedFile?: string;
  onFileClick: (filePath: string) => void;
  hideRoot: boolean;
  scope?: string;
  className?: string;
}

export const FileTree: FC<Props> = ({ files, onFileClick, selectedFile, hideRoot, scope, className }) => {
  const fileList = useMemo(() => buildFileList(files), [files]);

  const [collapsedFolders, setCollapsedFolders] = useState(() => new Set<number>());

  // reset collapsed folders when the list of files changes
  useEffect(() => {
    setCollapsedFolders(new Set<number>());
  }, [files]);

  const filteredFileList = useMemo(() => {
    const list = [];

    let lastDepth = Number.MAX_SAFE_INTEGER;
    for (let i = 0; i < fileList.length; i++) {
      const fileOrFolder = fileList[i];
      const depth = fileOrFolder.depth;

      // if the depth is equal we reached the end of the collaped group
      if (lastDepth == depth) {
        lastDepth = Number.MAX_SAFE_INTEGER;
      }

      // ignore collapsed folders
      if (collapsedFolders.has(i)) {
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
    <div className={className}>
      {filteredFileList.map((fileOrFolder) => {
        switch (fileOrFolder.kind) {
          case 'file':
            return (
              <File
                key={fileOrFolder.id}
                selected={selectedFile === fileOrFolder.fullPath}
                file={fileOrFolder}
                onClick={() => onFileClick(fileOrFolder.fullPath)}
              />
            );
          case 'folder':
            return (
              <Folder
                key={fileOrFolder.id}
                folder={fileOrFolder}
                collapsed={collapsedFolders.has(fileOrFolder.id)}
                onClick={() => toggleCollapseState(fileOrFolder.id)}
              />
            );
        }
      })}
    </div>
  );
};

const Folder: FC<{ folder: FolderNode; collapsed: boolean; onClick: () => void }> = ({
  folder: { depth, name },
  collapsed,
  onClick,
}) => (
  <NodeButton
    className="hover:bg-gray-50"
    depth={depth}
    icon={collapsed ? 'i-ph-folder-simple-duotone' : 'i-ph-folder-open-duotone'}
    onClick={onClick}
  >
    {name}
  </NodeButton>
);

interface FileProps {
  file: FileNode;
  selected: boolean;
  onClick: () => void;
}

const File: FC<FileProps> = ({ file: { depth, name }, onClick, selected }) => (
  <NodeButton
    className={selected ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-50'}
    depth={depth}
    icon="i-ph-file-duotone"
    onClick={onClick}
  >
    {name}
  </NodeButton>
);

interface ButtonProps {
  depth: number;
  icon: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

const NodeButton: FC<ButtonProps> = ({ depth, icon, onClick, className, children }) => (
  <button
    className={`flex items-center gap-2 w-full pr-2 border-2 border-transparent text-faded ${className ?? ''}`}
    style={{ paddingLeft: `${12 + depth * NODE_PADDING_LEFT}px` }}
    onClick={() => onClick?.()}
  >
    <div className={`${icon} scale-120 shrink-0`}></div>
    <span>{children}</span>
  </button>
);

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

function buildFileList(files: Files): Node[] {
  const fileList: Node[] = [];

  const folderPaths = new Set<string>();

  for (const fileName of Object.keys(files).sort()) {
    const segments = fileName.split('/').filter((s) => s);

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
          depth,
        });
      } else if (!folderPaths.has(fullPath)) {
        folderPaths.add(fullPath);

        fileList.push({
          kind: 'folder',
          id: fileList.length,
          name,
          depth,
        });
      }
    }
  }

  return fileList;
}
