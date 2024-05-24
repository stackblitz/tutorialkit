import { lazy, Suspense, useEffect, useState } from 'react';
import type { Props } from '../Terminal';

const Terminal = lazy(() => import('../Terminal'));

export function TerminalPanel(props: Props) {
  const [domLoaded, setDomLoaded] = useState(false);

  useEffect(() => {
    setDomLoaded(true);
  }, []);

  return (
    <div className="panel-container bg-tk-elements-app-backgroundColor">
      <div className="panel-header border-y border-tk-elements-app-borderColor">
        <div className="panel-title">
          <div className="panel-icon i-ph-terminal-window-duotone"></div>
          <span className="text-sm">Terminal</span>
        </div>
      </div>
      <div className="h-full overflow-hidden">
        {domLoaded && (
          <Suspense>
            <Terminal {...props} />
          </Suspense>
        )}
      </div>
    </div>
  );
}
