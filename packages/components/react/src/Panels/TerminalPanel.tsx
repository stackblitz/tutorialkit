import { useStore } from '@nanostores/react';
import type { TutorialStore } from '@tutorialkit/runtime';
import type { TerminalPanelType } from '@tutorialkit/types';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import type { TerminalRef } from '../core/Terminal/index.js';
import { classNames } from '../utils/classnames.js';

const Terminal = lazy(() => import('../core/Terminal/index.js'));

interface TerminalPanelProps {
  theme: 'dark' | 'light';
  tutorialStore: TutorialStore;
}

const ICON_MAP = new Map<TerminalPanelType, string>([
  ['output', 'i-ph-newspaper-duotone'],
  ['terminal', 'i-ph-terminal-window-duotone'],
]);

export function TerminalPanel({ theme, tutorialStore }: TerminalPanelProps) {
  const terminalConfig = useStore(tutorialStore.terminalConfig);

  const terminalRefs = useRef<Record<number, TerminalRef>>({});

  const [domLoaded, setDomLoaded] = useState(false);

  // select the terminal tab by default
  const [tabIndex, setTabIndex] = useState(terminalConfig.activePanel);

  useEffect(() => {
    setDomLoaded(true);
  }, []);

  useEffect(() => {
    setTabIndex(terminalConfig.activePanel);
  }, [terminalConfig]);

  useEffect(() => {
    return tutorialStore.themeRef.subscribe(() => {
      for (const ref of Object.values(terminalRefs.current)) {
        ref.reloadStyles();
      }
    });
  }, []);

  return (
    <div className="panel-container transition-theme bg-tk-elements-panel-backgroundColor text-tk-elements-panel-textColor">
      <div className="panel-tabs-header overflow-x-hidden">
        <div className="panel-title w-full">
          <ul
            className="flex h-full transition-theme border-b border-tk-elements-app-borderColor w-full"
            role="tablist"
            aria-orientation="horizontal"
          >
            {terminalConfig.panels.map(({ type, title }, index) => {
              const selected = tabIndex === index;

              return (
                <li key={index}>
                  <button
                    className={classNames(
                      'group h-full px-4 flex items-center gap-1.5 whitespace-nowrap text-sm position-relative transition-theme border-r border-tk-elements-panel-headerTab-borderColor',
                      {
                        'bg-tk-elements-panel-headerTab-backgroundColor text-tk-elements-panel-headerTab-textColor hover:bg-tk-elements-panel-headerTab-backgroundColorHover hover:text-tk-elements-panel-headerTab-textColorHover hover:border-tk-elements-panel-headerTab-borderColorHover':
                          !selected,
                        'bg-tk-elements-panel-headerTab-backgroundColorActive text-tk-elements-panel-headerTab-textColorActive border-tk-elements-panel-headerTab-borderColorActive':
                          selected,
                        'shadow-[0px_1px_0px_0px] shadow-tk-elements-panel-headerTab-backgroundColorActive': selected,
                        'border-l': index > 0,
                      },
                    )}
                    title={title}
                    id={`tk-terminal-tab-${index}`}
                    role="tab"
                    aria-selected={selected}
                    aria-controls={`tk-terminal-tapbanel-${index}`}
                    onClick={() => setTabIndex(index)}
                  >
                    <span
                      className={classNames(`text-tk-elements-panel-headerTab-iconColor ${ICON_MAP.get(type) ?? ''}`, {
                        'group-hover:text-tk-elements-panel-headerTab-iconColorHover': !selected,
                        'text-tk-elements-panel-headerTab-iconColorActive': selected,
                      })}
                    ></span>
                    {title}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <div className="h-full overflow-hidden">
        {domLoaded && (
          <Suspense>
            {terminalConfig.panels.map(({ id, type }, index) => (
              <Terminal
                key={id}
                role="tabpanel"
                id={`tk-terminal-tapbanel-${index}`}
                aria-labelledby={`tk-terminal-tab-${index}`}
                className={tabIndex !== index ? 'hidden h-full' : 'h-full'}
                theme={theme}
                readonly={type === 'output'}
                ref={(ref) => (terminalRefs.current[index] = ref!)}
                onTerminalReady={(terminal) => {
                  tutorialStore.attachTerminal(id, terminal);
                }}
                onTerminalResize={(cols, rows) => {
                  tutorialStore.onTerminalResize(cols, rows);
                }}
              />
            ))}
          </Suspense>
        )}
      </div>
    </div>
  );
}
