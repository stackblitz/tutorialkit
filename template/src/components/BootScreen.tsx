import { useStore } from '@nanostores/react';
import { useContext } from 'react';
import { TutorialRunnerContext, type Step } from './webcontainer/tutorial-runner';

export function BootScreen() {
  const tutorialRunner = useContext(TutorialRunnerContext);
  const steps = useStore(tutorialRunner.steps);

  return (
    <div className="h-full w-full flex justify-center items-center">
      {steps ? (
        <ul className="space-y-1">
          {steps.map((step, index) => (
            <li key={index} className={`flex items-center ${toTextColor(step.status)}`}>
              {step.status === 'idle' ? (
                <div className="inline-block mr-2 i-ph-circle-duotone scale-120" />
              ) : step.status === 'running' ? (
                <div className="inline-block mr-2 i-svg-spinners-90-ring-with-bg scale-105" />
              ) : step.status === 'completed' ? (
                <div className="inline-block mr-2 i-ph-check-circle-duotone scale-120" />
              ) : step.status === 'failed' ? (
                <div className="inline-block mr-2 i-ph-x-circle-duotone scale-120" />
              ) : (
                // skipped step
                <div className="inline-block mr-2 i-ph-minus-circle-duotone scale-120" />
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
}

function toTextColor(status: Step['status']): string {
  switch (status) {
    case 'completed': {
      return 'text-bootscreen-success';
    }
    case 'failed': {
      return 'text-bootscreen-failed';
    }
    case 'idle': {
      return 'text-gray-500/25';
    }
    case 'running': {
      return '';
    }
    case 'skipped': {
      return 'text-bootscreen-skipped';
    }
  }
}
