import { useStore } from '@nanostores/react';
import type { Step, TutorialStore } from '@tutorialkit/runtime';
import { useEffect, useState } from 'react';
import { classNames } from './utils/classnames.js';

interface Props {
  className?: string;
  tutorialStore: TutorialStore;
}

export function BootScreen({ className, tutorialStore }: Props) {
  const steps = useStore(tutorialStore.steps);
  const { startWebContainerText, noPreviewNorStepsText } = tutorialStore.lesson?.data.i18n ?? {};
  const bootStatus = useStore(tutorialStore.bootStatus);

  // workaround to prevent the hydration error caused by bootStatus always being 'unknown' server-side
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className={classNames('flex-grow w-full flex justify-center items-center text-sm', className)}>
      {isClient && bootStatus === 'blocked' ? (
        <Button onClick={() => tutorialStore.unblockBoot()}>{startWebContainerText}</Button>
      ) : steps ? (
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
                <div className="inline-block mr-2 i-ph-minus-circle-duotone scale-120 text-tk-elements-status-skipped-iconColor" />
              )}
              <span className={toTextColor(step.status)}>{step.title}</span>
            </li>
          ))}
        </ul>
      ) : (
        noPreviewNorStepsText
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

function Button({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      className="flex font-500 disabled:opacity-32 items-center text-sm ml-2 px-4 py-1 rounded-md bg-tk-elements-bootScreen-primaryButton-backgroundColor text-tk-elements-bootScreen-primaryButton-textColor hover:bg-tk-elements-bootScreen-primaryButton-backgroundColorHover hover:text-tk-elements-bootScreen-primaryButton-textColorHover"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
