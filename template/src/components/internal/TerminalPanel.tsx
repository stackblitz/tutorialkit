import { lazy, Suspense, useEffect, useState } from 'react';

const Terminal = lazy(() => import('../Terminal/Terminal'));

export function TerminalPanel() {
  const [domLoaded, setDomLoaded] = useState(false);

  useEffect(() => {
    setDomLoaded(true);
  }, []);

  return (
    <div className="panel-container">
      <div className="panel-header border-y border-panel-border">
        <div className="panel-title">
          <div className="i-ph-terminal-window-duotone"></div>
          <span className="text-sm">Terminal</span>
        </div>
      </div>
      <div className="h-full overflow-hidden">
        {domLoaded && (
          <Suspense>
            <Terminal />
          </Suspense>
        )}
      </div>
    </div>
  );
}
