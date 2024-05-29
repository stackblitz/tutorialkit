import { lazy, Suspense, useEffect, useState } from 'react';
import type { TutorialRunner } from '@tutorialkit/runtime';

const Terminal = lazy(() => import('../Terminal/index.js'));

interface TerminalPanelProps {
  theme: 'dark' | 'light';
  tutorialRunner: TutorialRunner
}

export function TerminalPanel({ theme, tutorialRunner }: TerminalPanelProps) {
  const [domLoaded, setDomLoaded] = useState(false);

  useEffect(() => {
    setDomLoaded(true);
  }, []);

  return (
    <div className="panel-container bg-tk-elements-app-backgroundColor">
      <div className="panel-header border-y border-tk-elements-app-borderColor">
        <div className="panel-title">
          <div className="panel-icon i-ph-newspaper-duotone"></div>
          <span className="text-sm">Output</span>
        </div>
      </div>
      <div className="h-full overflow-hidden">
        {domLoaded && (
          <Suspense>
            <Terminal
              theme={theme}
              readonly={true}
              onTerminalReady={(terminal) => tutorialRunner.hookOutputPanel(terminal)}
              onTerminalResize={() => tutorialRunner.onOutputResize()}/>
          </Suspense>
        )}
      </div>
    </div>
  );
}
