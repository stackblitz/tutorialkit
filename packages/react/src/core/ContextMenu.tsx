import { useRef, useState, type ComponentProps } from 'react';
import { Root, Portal, Content, Item, Trigger } from '@radix-ui/react-context-menu';
import picomatch from 'picomatch/posix';
import type { FileDescriptor, I18n } from '@tutorialkit/types';

interface FileChangeEvent {
  type: FileDescriptor['type'];
  method: 'add' | 'remove' | 'rename';
  value: string;
}

interface FileRenameEvent extends FileChangeEvent {
  method: 'rename';
  oldValue: string;
}

interface Props extends ComponentProps<'div'> {
  /** Callback invoked when file is changed. */
  onFileChange?: (event: FileChangeEvent | FileRenameEvent) => void;

  /** Glob patterns for paths that allow editing files and folders. Defaults to `['**']`. */
  allowEditPatterns?: string[];

  /** Directory of the clicked file. */
  directory: string;

  /** Whether to render new files/directories before or after the trigger element. Defaults to `'before'`. */
  position?: 'before' | 'after';

  /** Localized texts for menu. */
  i18n?: Pick<I18n, 'fileTreeCreateFileText' | 'fileTreeCreateFolderText'>;

  /** Props for trigger wrapper. */
  triggerProps?: ComponentProps<'div'> & { 'data-testid'?: string };
}

export function ContextMenu({
  onFileChange,
  allowEditPatterns = ['**'],
  directory,
  i18n,
  position = 'before',
  children,
  triggerProps,
  ...props
}: Props) {
  const [state, setState] = useState<'idle' | 'add_file' | 'add_folder'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  if (!onFileChange) {
    return children;
  }

  function onFileNameEnd(event: React.KeyboardEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) {
    const name = event.currentTarget.value;

    if (name) {
      const value = `${directory}/${name}`;
      const isAllowed = picomatch.isMatch(value, allowEditPatterns);

      if (isAllowed) {
        onFileChange?.({
          value,
          type: state === 'add_file' ? 'file' : 'folder',
          method: 'add',
        });
      } else {
        // TODO: Use `@radix-ui/react-dialog` instead
        alert(`File "${value}" is not allowed. Allowed patterns: [${allowEditPatterns.join(', ')}].`);
      }
    }

    setState('idle');
  }

  function onFileNameKeyPress(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' && event.currentTarget.value !== '') {
      onFileNameEnd(event);
    }
  }

  function onCloseAutoFocus(event: Event) {
    if ((state === 'add_file' || state === 'add_folder') && inputRef.current) {
      event.preventDefault();
      inputRef.current.focus();
    }
  }

  const element = (
    <Trigger asChild>
      <div {...triggerProps}>{children}</div>
    </Trigger>
  );

  return (
    <Root>
      {position === 'before' && element}

      {state !== 'idle' && (
        <div className="flex items-center gap-2 border-2 border-solid border-transparent" {...props}>
          <div className={`scale-120 shrink-0 ${state === 'add_file' ? 'i-ph-file-duotone' : 'i-ph-folder-duotone'}`} />
          <input
            ref={inputRef}
            autoFocus
            type="text"
            onBlur={onFileNameEnd}
            onKeyUp={onFileNameKeyPress}
            className="text-current bg-transparent w-20 outline-var(--tk-border-accent)"
          />
        </div>
      )}

      {position === 'after' && element}

      <Portal>
        <Content
          onCloseAutoFocus={onCloseAutoFocus}
          className="border border-tk-border-brighter b-rounded-md bg-tk-background-brighter py-2"
        >
          <MenuItem icon="i-ph-file-plus" onClick={() => setState('add_file')}>
            {i18n?.fileTreeCreateFileText || 'Create file'}
          </MenuItem>

          <MenuItem icon="i-ph-folder-plus" onClick={() => setState('add_folder')}>
            {i18n?.fileTreeCreateFolderText || 'Create folder'}
          </MenuItem>
        </Content>
      </Portal>
    </Root>
  );
}

function MenuItem({ icon, children, ...props }: { icon: string } & ComponentProps<typeof Item>) {
  return (
    <Item
      {...props}
      className="flex items-center gap-2 px-4 py-1 text-sm cursor-pointer ws-nowrap text-tk-elements-fileTree-folder-textColor hover:bg-tk-elements-fileTree-file-backgroundColorHover"
    >
      <span className={`${icon} scale-120 shrink-0`}></span>
      <span>{children}</span>
    </Item>
  );
}
