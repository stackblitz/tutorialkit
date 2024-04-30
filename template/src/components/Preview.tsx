import { useStore } from '@nanostores/react';
import { useContext, forwardRef, useImperativeHandle, useRef } from 'react';
import { TutorialRunnerContext, type Step } from './webcontainer/tutorial-runner';

export type ImperativePreviewHandle = {
  reload: () => void;
};

export const Preview = forwardRef<ImperativePreviewHandle>((_, ref) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const tutorialRunner = useContext(TutorialRunnerContext);
  const previewUrl = useStore(tutorialRunner.previewUrl);
  const steps = useStore(tutorialRunner.steps);

  useImperativeHandle(
    ref,
    () => ({
      reload: () => {
        if (iframeRef.current) {
          iframeRef.current.src = iframeRef.current.src;
        }
      },
    }),
    [],
  );

  return (
    <div className="h-full w-full flex justify-center items-center">
      {previewUrl ? (
        <iframe ref={iframeRef} src={previewUrl} className="h-full w-full"></iframe>
      ) : steps ? (
        <ul>
          {steps.map((step, index) => (
            <li key={index} className={`flex items-center ${toTextcolor(step.status)}`}>
              {step.status === 'idle' ? (
                <div className="inline-block mr-2 i-ph-circle-duotone" />
              ) : step.status === 'running' ? (
                <div className="inline-block mr-2 animate-spin i-ph-spinner-duotone" />
              ) : step.status === 'completed' ? (
                <div className="inline-block mr-2 i-ph-check-circle-duotone" />
              ) : step.status === 'errored' ? (
                <div className="inline-block mr-2 i-ph-x-circle-duotone" />
              ) : (
                /* step.status === 'skipped' */
                <div className="inline-block mr-2 i-ph-warning-circle-duotone" />
              )}
              {step.title}
            </li>
          ))}
        </ul>
      ) : (
        'No preview to run nor steps to show'
      )}
    </div>
  );
});

function toTextcolor(status: Step['status']): string {
  switch (status) {
    case 'completed':
      return 'text-green-7';
    case 'errored':
      return 'text-red-6';
    case 'idle':
      return 'text-gray-4';
    case 'running':
      return '';
    case 'skipped':
      return 'text-yellow-5';
  }
}
