import * as RadixDialog from '@radix-ui/react-dialog';
import { type ReactNode, createContext, useContext } from 'react';
import { Button } from '../Button.js';

interface Props {
  /** Title of the dialog */
  title: string;

  /** Text for the confirmation button */
  confirmText: string;

  /** Callback invoked when dialog is closed */
  onClose: () => void;

  /** Content of the dialog */
  children: ReactNode;
}

const context = createContext(Dialog);
export const DialogProvider = context.Provider;

export function useDialog() {
  return useContext(context);
}

export default function Dialog({ title, confirmText, onClose, children }: Props) {
  return (
    <RadixDialog.Root open={true} onOpenChange={(open) => !open && onClose()}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed z-11 inset-0 opacity-50 bg-black" />

        <RadixDialog.Content className="fixed z-11 top-50% left-50% transform-translate--50% w-90vw max-w-450px max-h-85vh rounded-xl text-tk-text-primary bg-tk-background-primary">
          <div className="relative p-10">
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
