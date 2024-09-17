import { useRef, useState, type ComponentProps, type ReactNode } from 'react';
import { Root, Portal, Content, Item, Trigger } from '@radix-ui/react-context-menu';
import * as RadixDialog from '@radix-ui/react-dialog';
import picomatch from 'picomatch/posix';
import { interpolateString, type FileDescriptor, type I18n } from '@tutorialkit/types';

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
  i18n?: Pick<
    I18n,
    | 'fileTreeCreateFileText'
    | 'fileTreeCreateFolderText'
    | 'fileTreeFailedToCreateFileText'
    | 'fileTreeFailedToCreateFolderText'
    | 'fileTreeAllowedPatternsText'
  >;

  /** Props for trigger wrapper. */
  triggerProps?: ComponentProps<'div'> & { 'data-testid'?: string };
}

const i18nDefaults = {
  fileTreeFailedToCreateFileText: 'Failed to create file "${filename}".',
  fileTreeFailedToCreateFolderText: 'Failed to create folder "${filename}".',
  fileTreeCreateFileText: 'Create file',
  fileTreeCreateFolderText: 'Create folder',
  fileTreeAllowedPatternsText: 'Allowed patterns are:',
} as const satisfies Props['i18n'];

export function ContextMenu({
  onFileChange,
  allowEditPatterns = ['**'],
  directory,
  i18n: i18nProps,
  position = 'before',
  children,
  triggerProps,
  ...props
}: Props) {
  const [state, setState] = useState<'idle' | 'add_file' | 'add_folder' | { error: string }>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  const error = typeof state === 'string' ? false : state.error;
  const i18n = { ...i18nProps, ...i18nDefaults };

  if (!onFileChange) {
    return children;
  }

  function onFileNameEnd(event: React.KeyboardEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) {
    if (state !== 'add_file' && state !== 'add_folder') {
      return;
    }

    const name = event.currentTarget.value;

    if (name) {
      const value = `${directory}/${name}`;
      const isAllowed = picomatch.isMatch(value, allowEditPatterns);
      const isFile = state === 'add_file';

      if (isAllowed) {
        onFileChange?.({
          value,
          type: isFile ? 'file' : 'folder',
          method: 'add',
        });
      } else {
        const text = isFile ? i18n.fileTreeFailedToCreateFileText : i18n.fileTreeFailedToCreateFolderText;

        return setState({ error: interpolateString(text, { filename: value }) });
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
            {i18n.fileTreeCreateFileText}
          </MenuItem>

          <MenuItem icon="i-ph-folder-plus" onClick={() => setState('add_folder')}>
            {i18n.fileTreeCreateFolderText}
          </MenuItem>
        </Content>
      </Portal>

      {error && (
        <Dialog onClose={() => setState('idle')}>
          <p className="mb-2">{error}</p>

          <div>
            {i18n.fileTreeAllowedPatternsText}
            <ul className="list-disc ml-4 mt-2">
              {allowEditPatterns.map((pattern) => (
                <li key={pattern}>
                  <code>{pattern}</code>
                </li>
              ))}
            </ul>
          </div>
        </Dialog>
      )}
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

function Dialog({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  return (
    <RadixDialog.Root open={true} onOpenChange={(open) => !open && onClose()}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 opacity-50 bg-black" />

        <RadixDialog.Content className="fixed top-50% left-50% transform-translate--50% w-90vw max-w-450px max-h-85vh rounded-xl text-tk-text-primary bg-tk-background-negative">
          <div className="relative py-4 px-10">
            <RadixDialog.Title className="text-6 mb-2">Error</RadixDialog.Title>

            {children}

            <RadixDialog.Close title="Close" className="absolute top-4 right-4 w-6 h-6">
              <span aria-hidden className="i-ph-x block w-full h-full"></span>
            </RadixDialog.Close>
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
