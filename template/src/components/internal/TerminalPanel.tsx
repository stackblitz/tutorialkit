import { lazy, Suspense, useEffect, useState } from 'react';

const Terminal = lazy(() => import('../Terminal/Terminal'));

export default function TerminalPanel() {
  const [domLoaded, setDomLoaded] = useState(false);

  useEffect(() => {
    setDomLoaded(true);
  }, []);

  return (
    <div className="panel-container">
      <div className="panel-header border-y border-panel-border">
        <div className="i-ph-terminal-window-duotone panel-icon-size"></div>
        <span>Terminal</span>
      </div>
      <div className="h-full">
        {domLoaded && (
          <Suspense>
            <Terminal />
          </Suspense>
        )}
      </div>
    </div>
  );
}
