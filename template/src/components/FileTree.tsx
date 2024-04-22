import type { Files } from '@entities/tutorial';
import { createContext, useContext, useEffect, useState, type HTMLAttributes } from 'react';

const NODE_PADDING_LEFT = 12;
const DEFAULT_HIDDEN_FILES = [/\/node_modules\//];

type OnFileClickCallback = (filePath: string) => void;

interface FileTreeProps {
  files: Files;
  selectedFile?: string;
  hideRoot?: boolean;
  scope?: string;
  hiddenFiles?: Array<string | RegExp>;
  onFileClick?: OnFileClickCallback;
}

interface TreeNodeProps {
  node: File | Directory;
  depth: number;
}

interface DirectoryTreeNodeProps {
  node: Directory;
  depth: number;
}

interface FileTreeNodeProps {
  node: File;
  depth: number;
  children: JSX.Element | string;
}

interface TreeNodeButtonProps {
  depth: number;
  icon: string;
  children: JSX.Element | string;
  onClick?: () => void;
}

type FileTree = Directory;

interface File {
  type: 'file';
  name: string;
  path: string;
}

interface Directory {
  type: 'directory';
  name: string;
  children: Record<string, File | Directory>;
}

interface FileTreeContext {
  selectedFile?: string;
  setSelectedFile: (filePath: string) => void;
}

export const FileTreeContext = createContext<FileTreeContext>({
  setSelectedFile: (filePath: string) => {},
});

function TreeNodeButton({
  depth,
  icon,
  onClick,
  children,
  className,
  ...props
}: TreeNodeButtonProps & HTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`flex items-center gap-2 w-full pr-2 border-2 border-transparent text-faded ${className ?? ''}`}
      style={{ paddingLeft: `${12 + depth * NODE_PADDING_LEFT}px` }}
      onClick={() => onClick?.()}
      {...props}
    >
      <div className={`${icon} scale-120 shrink-0`}></div>
      <span>{children}</span>
    </button>
  );
}

function FileTreeNode({ node, depth, children }: FileTreeNodeProps) {
  const { setSelectedFile } = useContext(FileTreeContext);

  return (
    <TreeNodeButton
      depth={depth}
      icon="i-ph-file-duotone"
      onClick={() => {
        setSelectedFile(node.path);
      }}
    >
      {children}
    </TreeNodeButton>
  );
}

function DirectoryTreeNode({ node, depth }: DirectoryTreeNodeProps) {
  const [collapsed, setCollapsed] = useState(false);
  const fileTreeContext = useContext(FileTreeContext);

  return (
    <>
      <TreeNodeButton
        className="hover:bg-gray-50"
        depth={depth}
        icon={collapsed ? 'i-ph-folder-simple-duotone' : 'i-ph-folder-open-duotone'}
        onClick={() => setCollapsed(!collapsed)}
      >
        {node.name}
      </TreeNodeButton>
      {!collapsed && (
        <ul>
          {Object.values(node.children).map((childNode, index) => {
            return (
              <li
                key={index}
                className={` ${
                  childNode.type === 'file' && fileTreeContext.selectedFile === childNode.path
                    ? 'bg-primary-100 text-primary-700'
                    : 'hover:bg-gray-50'
                }`}
              >
                <TreeNode node={childNode} depth={depth} />
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

function TreeNode({ node, depth }: TreeNodeProps) {
  const _depth = depth + 1;

  return (
    <>
      {node.type === 'file' ? (
        <FileTreeNode node={node} depth={_depth}>
          {node.name}
        </FileTreeNode>
      ) : (
        <DirectoryTreeNode node={node} depth={_depth} />
      )}
    </>
  );
}

/**
 * TODO: Add ability to specify where files and what files can be created per lesson.
 */
export default function FileTree({
  hiddenFiles,
  selectedFile,
  files,
  scope,
  hideRoot,
  onFileClick,
  ...props
}: FileTreeProps & HTMLAttributes<HTMLDivElement>) {
  const [fileTree, setFileTree] = useState<FileTree>();
  const [_selectedFile, setSelectedFile] = useState(selectedFile);

  useEffect(() => {
    const _fileTree = createFileTree(files, scope, hiddenFiles);
    setFileTree(_fileTree);
  }, [files, scope, hiddenFiles]);

  return (
    <FileTreeContext.Provider
      value={{
        selectedFile: _selectedFile,
        setSelectedFile: (filePath) => {
          setSelectedFile(filePath);
          onFileClick?.(filePath);
        },
      }}
    >
      <div {...props}>
        {fileTree ? (
          hideRoot ? (
            Object.values(fileTree.children).map((childNode, index) => {
              return (
                <div key={index}>
                  <TreeNode node={childNode} depth={-1} />
                </div>
              );
            })
          ) : (
            <DirectoryTreeNode node={fileTree} depth={0} />
          )
        ) : null}
      </div>
    </FileTreeContext.Provider>
  );
}

export function createFileTree(files: Files, scope?: string, hiddenFiles?: Array<string | RegExp>) {
  const root: FileTree = { type: 'directory', name: '/', children: {} };

  let _hiddenFiles: Array<string | RegExp> = DEFAULT_HIDDEN_FILES;

  if (hiddenFiles && hiddenFiles.length > 0) {
    _hiddenFiles.push(...hiddenFiles);
  }

  for (const filePath in files) {
    if (scope && !filePath.startsWith(scope)) {
      continue;
    }

    const parts = filePath.split('/');
    const fileName = parts.at(-1);

    if (!fileName) {
      continue;
    }

    if (isHiddenFile(filePath, fileName, _hiddenFiles)) {
      continue;
    }

    let current: Directory = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];

      if (!part) {
        continue;
      }

      if (i === parts.length - 1) {
        current.children[part] = {
          type: 'file',
          name: part,
          path: filePath,
        };
      } else {
        if (!current.children[part]) {
          current.children![part] = {
            type: 'directory',
            name: part,
            children: {},
          };
        }

        current = current.children[part] as Directory;
      }
    }
  }

  return root;
}

function isHiddenFile(filePath: string, fileName: string, hiddenFiles: Array<string | RegExp>) {
  return hiddenFiles.some((pathOrRegex) => {
    if (typeof pathOrRegex === 'string') {
      return fileName === pathOrRegex;
    }

    return pathOrRegex.test(filePath);
  });
}
