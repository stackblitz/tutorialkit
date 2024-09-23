import { Root, Portal, Content, Item, Trigger } from '@radix-ui/react-context-menu';
import { DEFAULT_LOCALIZATION, type FileDescriptor, type I18n, type FilesystemError } from '@tutorialkit/types';
import picomatch from 'picomatch/posix';
import { useRef, useState, type ComponentProps } from 'react';
import { classNames } from '../utils/classnames.js';
import { useDialog } from './Dialog.js';

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
  /** Callback invoked when file is changed. This callback should throw errors with {@link FilesystemError} messages. */
  onFileChange?: (event: FileChangeEvent | FileRenameEvent) => Promise<void>;

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
    | 'fileTreeFileExistsAlreadyText'
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
  const [state, setState] = useState<
    'idle' | 'add_file' | 'add_folder' | 'add_failed_not_allowed' | 'add_failed_exists'
  >('idle');
  const inputRef = useRef<HTMLInputElement>(null);
  const Dialog = useDialog();

  if (!allowEditPatterns?.length) {
    return children;
  }

  async function onFileNameEnd(event: React.KeyboardEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) {
    if (state !== 'add_file' && state !== 'add_folder') {
      return;
    }

    const name = event.currentTarget.value;

    if (name) {
      const value = `${directory}/${name}`;
      const isAllowed = picomatch.isMatch(value, allowEditPatterns!);

      if (!isAllowed) {
        return setState('add_failed_not_allowed');
      }

      try {
        await onFileChange?.({
          value,
          type: state === 'add_file' ? 'file' : 'folder',
          method: 'add',
        });
      } catch (error: any) {
        const message: FilesystemError | (string & {}) | undefined = error?.message;

        if (message === 'FILE_EXISTS' || message === 'FOLDER_EXISTS') {
          return setState('add_failed_exists');
        }
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

      {(state === 'add_failed_not_allowed' || state === 'add_failed_exists') && (
        <Dialog
          title={i18n?.fileTreeActionNotAllowedText || DEFAULT_LOCALIZATION.fileTreeActionNotAllowedText}
          confirmText={i18n?.confirmationText || DEFAULT_LOCALIZATION.confirmationText}
          onClose={() => setState('idle')}
        >
          {state === 'add_failed_not_allowed' ? (
            <>
              {i18n?.fileTreeAllowedPatternsText || DEFAULT_LOCALIZATION.fileTreeAllowedPatternsText}
              <AllowPatternsList allowEditPatterns={allowEditPatterns} />
            </>
          ) : (
            <>{i18n?.fileTreeFileExistsAlreadyText || DEFAULT_LOCALIZATION.fileTreeFileExistsAlreadyText}</>
          )}
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

function AllowPatternsList({ allowEditPatterns }: Required<Pick<Props, 'allowEditPatterns'>>) {
  return (
    <ul className={classNames('mt-2', allowEditPatterns.length > 1 && 'list-disc ml-4')}>
      {allowEditPatterns.map((pattern) => (
        <li key={pattern} className="mb-1">
          <code>{pattern}</code>
        </li>
      ))}
    </ul>
  );
}
