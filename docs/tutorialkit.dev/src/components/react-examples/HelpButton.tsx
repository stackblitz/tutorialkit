import { Dialog } from '@tutorialkit/react';
import { useState } from 'react';

export function HelpButton() {
  const [message, setMessage] = useState<string | null>(null);

  async function onClick() {
    setMessage('Your index.js should have a default export');
  }

  return (
    <>
      <button
        onClick={onClick}
        className="px-4 py-1 my-3 cursor-pointer border-1 border-tk-border-primary rounded-md bg-tk-elements-primaryButton-backgroundColor text-tk-elements-primaryButton-textColor"
      >
        Help
      </button>

      {message && (
        <Dialog title="Help" confirmText="OK" onClose={() => setMessage(null)}>
          {message}
        </Dialog>
      )}
    </>
  );
}
