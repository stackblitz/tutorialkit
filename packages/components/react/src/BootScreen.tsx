import { useStore } from '@nanostores/react';
import type { Step, TutorialRunner } from '@tutorialkit/runtime';
import { classNames } from './utils/classnames.js';

interface Props {
  className?: string;
  tutorialRunner: TutorialRunner;
}

export function BootScreen({ className, tutorialRunner }: Props) {
  const steps = useStore(tutorialRunner.steps);

  return (
    <div
      className={classNames(
        'h-full w-full flex justify-center items-center text-sm bg-tk-elements-app-backgroundColor text-tk-elements-app-textColor',
        className,
      )}
    >
      {steps ? (
        <ul className="space-y-1">
          {steps.map((step, index) => (
            <li key={index} className="flex items-center">
              {step.status === 'idle' ? (
                <div className="inline-block mr-2 i-ph-circle-duotone scale-120 text-tk-elements-status-disabled-iconColor" />
              ) : step.status === 'running' ? (
                <div className="inline-block mr-2 i-svg-spinners-90-ring-with-bg scale-105 text-tk-elements-status-active-iconColor" />
              ) : step.status === 'completed' ? (
                <div className="inline-block mr-2 i-ph-check-circle-duotone scale-120 text-tk-elements-status-positive-iconColor" />
              ) : step.status === 'failed' ? (
                <div className="inline-block mr-2 i-ph-x-circle-duotone scale-120 text-tk-elements-status-negative-iconColor" />
              ) : (
                // skipped step
                <div className="inline-block mr-2 i-ph-minus-circle-duotone scale-120 text-tk-elements-status-skipped-iconColor" />
              )}
              <span className={toTextColor(step.status)}>{step.title}</span>
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
      return 'text-tk-elements-status-positive-textColor';
    }
    case 'failed': {
      return 'text-tk-elements-status-negative-textColor';
    }
    case 'idle': {
      return 'text-tk-elements-status-disabled-textColor';
    }
    case 'running': {
      return 'text-tk-elements-status-active-textColor';
    }
    case 'skipped': {
      return 'text-tk-elements-status-skipped-textColor';
    }
  }
}
