import type DialogType from '@tutorialkit/react/dialog';
import type { ComponentProps } from 'react';
import { createPortal } from 'react-dom';

export default function Dialog({ title, confirmText, onClose, children }: ComponentProps<typeof DialogType>) {
  return createPortal(
    <div role="dialog" className="fixed z-11 inset-50 color-tk-text-warning bg-tk-background-accent p-10 z-99">
      <h2>Custom Dialog</h2>
      <h3>{title}</h3>

      {children}

      <button className="mt2 p2 border border-tk-border-warning rounded" onClick={onClose}>
        {confirmText}
      </button>
    </div>,
    document.body,
  );
}
