import type { FileDescriptor } from '@tutorialkit/types';
import { useEffect, useMemo, useState, type ComponentProps, type ReactNode } from 'react';
import { classNames } from '../utils/classnames.js';
import { ContextMenu } from './ContextMenu.js';

const NODE_PADDING_LEFT = 12;
const DEFAULT_HIDDEN_FILES = [/\/node_modules\//];

interface Props {
  files: FileDescriptor[];
  selectedFile?: string;
  onFileSelect?: (filePath: string) => void;
  onFileChange?: ComponentProps<typeof ContextMenu>['onFileChange'];
  allowEditPatterns?: ComponentProps<typeof ContextMenu>['allowEditPatterns'];
  i18n?: ComponentProps<typeof ContextMenu>['i18n'];
  hideRoot: boolean;
  scope?: string;
  hiddenFiles?: Array<string | RegExp>;
  className?: string;
}

export function FileTree({
  files,
  onFileSelect,
  onFileChange,
  allowEditPatterns,
  selectedFile,
  hideRoot,
  scope,
  hiddenFiles,
  i18n,
  className,
}: Props) {
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
    <div className={classNames(className, 'h-full transition-theme bg-tk-elements-fileTree-backgroundColor')}>
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
                i18n={i18n}
                collapsed={collapsedFolders.has(fileOrFolder.id)}
                onClick={() => toggleCollapseState(fileOrFolder.id)}
                onFileChange={onFileChange}
                allowEditPatterns={allowEditPatterns}
              />
            );
          }
        }
      })}

      <ContextMenu // context menu for the remaining free space area
        position="after"
        i18n={i18n}
        style={getDepthStyle(0)}
        directory=""
        onFileChange={onFileChange}
        allowEditPatterns={allowEditPatterns}
        triggerProps={{ className: 'h-full min-h-4', 'data-testid': 'file-tree-root-context-menu' }}
      />
    </div>
  );
}

export default FileTree;

interface FolderProps {
  folder: FolderNode;
  collapsed: boolean;
  onClick: () => void;
  onFileChange: Props['onFileChange'];
  allowEditPatterns: Props['allowEditPatterns'];
  i18n: Props['i18n'];
}

function Folder({
  folder: { depth, name, fullPath },
  i18n,
  collapsed,
  onClick,
  onFileChange,
  allowEditPatterns,
}: FolderProps) {
  return (
    <ContextMenu
      onFileChange={onFileChange}
      allowEditPatterns={allowEditPatterns}
      i18n={i18n}
      directory={fullPath}
      style={getDepthStyle(1 + depth)}
    >
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
    </ContextMenu>
  );
}

interface FileProps {
  file: FileNode;
  selected: boolean;
  onClick: () => void;
}

function File({ file: { depth, name }, onClick, selected }: FileProps) {
  const extension = getFileExtension(name);
  const fileIcon = extensionsToIcons.get(extension) || 'i-ph-file-duotone';

  return (
    <NodeButton
      className={classNames('group transition-theme', {
        'bg-tk-elements-fileTree-file-backgroundColor hover:bg-tk-elements-fileTree-file-backgroundColorHover text-tk-elements-fileTree-file-textColor hover:text-tk-elements-fileTree-file-textColorHover':
          !selected,
        'bg-tk-elements-fileTree-file-backgroundColorSelected text-tk-elements-fileTree-file-textColorSelected':
          selected,
      })}
      depth={depth}
      iconClasses={classNames(fileIcon, {
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
      style={getDepthStyle(depth)}
      onClick={onClick}
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
  fullPath: string;
  kind: FileDescriptor['type'];
}

interface FileNode extends BaseNode {
  kind: 'file';
}

interface FolderNode extends BaseNode {
  kind: 'folder';
}

function buildFileList(
  files: FileDescriptor[],
  hideRoot: boolean,
  scope: string | undefined,
  hiddenFiles: Array<string | RegExp>,
): Node[] {
  const folderPaths = new Set<string>();
  const fileList: Node[] = [];
  const defaultDepth = hideRoot ? 0 : 1;

  if (!hideRoot) {
    fileList.push({ kind: 'folder', name: '/', fullPath: '/', depth: 0, id: 0 });
  }

  for (const file of [...files].sort(sortFiles)) {
    if (scope && !file.path.startsWith(scope)) {
      continue;
    }

    const segments = file.path.split('/').filter((s) => s);
    const fileName = segments.at(-1);

    if (!fileName || isHiddenFile(file.path, fileName, hiddenFiles)) {
      continue;
    }

    let currentPath = '';

    for (let depth = 0; depth < segments.length; ++depth) {
      const name = segments[depth];
      const fullPath = (currentPath += `/${name}`);

      if (depth === segments.length - 1) {
        fileList.push({
          kind: file.type,
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
          fullPath,
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

function getDepthStyle(depth: number) {
  return { paddingLeft: `${12 + depth * NODE_PADDING_LEFT}px` };
}

export function sortFiles(fileA: FileDescriptor, fileB: FileDescriptor) {
  const segmentsA = fileA.path.split('/');
  const segmentsB = fileB.path.split('/');
  const minLength = Math.min(segmentsA.length, segmentsB.length);

  for (let i = 0; i < minLength; i++) {
    const a = toFileSegment(fileA, segmentsA, i);
    const b = toFileSegment(fileB, segmentsB, i);

    // folders are always shown before files
    if (a.type !== b.type) {
      return a.type === 'folder' ? -1 : 1;
    }

    const comparison = compareString(a.path, b.path);

    // either folder name changed or last segments are compared
    if (comparison !== 0 || a.isLast || b.isLast) {
      return comparison;
    }
  }

  return compareString(fileA.path, fileB.path);
}

function toFileSegment(file: FileDescriptor, segments: string[], current: number) {
  const isLast = current + 1 === segments.length;

  return { path: segments[current], type: isLast ? file.type : 'folder', isLast };
}

function compareString(a: string, b: string) {
  if (a < b) {
    return -1;
  }

  if (a > b) {
    return 1;
  }

  return 0;
}

function getFileExtension(filename: string) {
  const parts = filename.split('.');

  parts.shift();

  const extension = parts.at(-1) || '';

  return extension;
}

const extensionsToIcons = new Map([
  ['ts', 'i-ph-file-ts-duotone'],
  ['cts', 'i-ph-file-ts-duotone'],
  ['mts', 'i-ph-file-ts-duotone'],

  ['tsx', 'i-ph-file-tsx-duotone'],

  ['js', 'i-ph-file-js-duotone'],
  ['cjs', 'i-ph-file-js-duotone'],
  ['mjs', 'i-ph-file-js-duotone'],

  ['jsx', 'i-ph-file-jsx-duotone'],

  ['html', 'i-ph-file-html-duotone'],

  ['css', 'i-ph-file-css-duotone'],

  ['md', 'i-ph-file-md-duotone'],

  ['vue', 'i-ph-file-vue-duotone'],

  ['gif', 'i-ph-file-image-duotone'],
  ['jpg', 'i-ph-file-image-duotone'],
  ['jpeg', 'i-ph-file-image-duotone'],
  ['png', 'i-ph-file-image-duotone'],

  ['svg', 'i-ph-file-svg-duotone'],
]);
