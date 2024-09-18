import { Root, Portal, Content, Item, Trigger } from '@radix-ui/react-context-menu';
import * as RadixDialog from '@radix-ui/react-dialog';
import { DEFAULT_LOCALIZATION, type FileDescriptor, type I18n } from '@tutorialkit/types';
import picomatch from 'picomatch/posix';
import { useRef, useState, type ComponentProps, type ReactNode } from 'react';
import { Button } from '../Button.js';
import { classNames } from '../utils/classnames.js';

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

  /** Glob patterns for paths that allow editing files and folders. Disabled by default. */
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
    | 'fileTreeActionNotAllowedText'
    | 'fileTreeAllowedPatternsText'
    | 'confirmationText'
  >;

  /** Props for trigger wrapper. */
  triggerProps?: ComponentProps<'div'> & { 'data-testid'?: string };
}

export function ContextMenu({
  onFileChange,
  allowEditPatterns,
  directory,
  i18n,
  position = 'before',
  children,
  triggerProps,
  ...props
}: Props) {
  const [state, setState] = useState<'idle' | 'add_file' | 'add_folder' | 'add_failed'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  if (!allowEditPatterns?.length) {
    return children;
  }

  function onFileNameEnd(event: React.KeyboardEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) {
    if (state !== 'add_file' && state !== 'add_folder') {
      return;
    }

    const name = event.currentTarget.value;

    if (name) {
      const value = `${directory}/${name}`;
      const isAllowed = picomatch.isMatch(value, allowEditPatterns!);

      if (isAllowed) {
        onFileChange?.({
          value,
          type: state === 'add_file' ? 'file' : 'folder',
          method: 'add',
        });
      } else {
        return setState('add_failed');
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
            {i18n?.fileTreeCreateFileText || DEFAULT_LOCALIZATION.fileTreeCreateFileText}
          </MenuItem>

          <MenuItem icon="i-ph-folder-plus" onClick={() => setState('add_folder')}>
            {i18n?.fileTreeCreateFolderText || DEFAULT_LOCALIZATION.fileTreeCreateFolderText}
          </MenuItem>
        </Content>
      </Portal>

      {state === 'add_failed' && (
        <Dialog
          title={i18n?.fileTreeActionNotAllowedText || DEFAULT_LOCALIZATION.fileTreeActionNotAllowedText}
          confirmText={i18n?.confirmationText || DEFAULT_LOCALIZATION.confirmationText}
          onClose={() => setState('idle')}
        >
          {i18n?.fileTreeAllowedPatternsText || DEFAULT_LOCALIZATION.fileTreeAllowedPatternsText}
          <ul className={classNames('mt-2', allowEditPatterns.length > 1 && 'list-disc ml-4')}>
            {allowEditPatterns.map((pattern) => (
              <li key={pattern} className="mb-1">
                <code>{pattern}</code>
              </li>
            ))}
          </ul>
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

function Dialog({
  title,
  confirmText,
  onClose,
  children,
}: {
  title: string;
  confirmText: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <RadixDialog.Root open={true} onOpenChange={(open) => !open && onClose()}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 opacity-50 bg-black" />

        <RadixDialog.Content className="fixed top-50% left-50% transform-translate--50% w-90vw max-w-450px max-h-85vh rounded-xl text-tk-text-primary bg-tk-background-primary">
          <div className="relative py-4 px-10">
            <RadixDialog.Title className="text-6">{title}</RadixDialog.Title>

            <div className="my-4">{children}</div>

            <RadixDialog.Close asChild>
              <Button className="min-w-20 justify-center">{confirmText}</Button>
            </RadixDialog.Close>
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
