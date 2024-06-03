import { lazy, Suspense, useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { type TutorialRunner, type TerminalPanelType } from '@tutorialkit/runtime';
import { classNames } from '../utils/classnames.js';

const Terminal = lazy(() => import('../Terminal/index.js'));

interface TerminalPanelProps {
  theme: 'dark' | 'light';
  tutorialRunner: TutorialRunner
}

const ICON_MAP = new Map<TerminalPanelType, string>([
  ['output', 'i-ph-newspaper-duotone'],
  ['terminal', 'i-ph-terminal-window-duotone']
]);

export function TerminalPanel({ theme, tutorialRunner }: TerminalPanelProps) {
  const terminalConfig = useStore(tutorialRunner.terminalConfig);

  const [domLoaded, setDomLoaded] = useState(false);

  // select the terminal tab by default
  const [tabIndex, setTabIndex] = useState(terminalConfig.activePanel);

  useEffect(() => {
    setDomLoaded(true);
  }, []);

  useEffect(() => {
    setTabIndex(terminalConfig.activePanel);
  }, [terminalConfig]);

  return (
    <div className="panel-container bg-tk-elements-app-backgroundColor">
      <div className="panel-tabs-header border-t border-tk-elements-app-borderColor overflow-x-hidden">
        <div className="panel-title w-full">
          <ul className="flex h-full border-b border-tk-elements-app-borderColor w-full" role="tablist" aria-orientation="horizontal">
            {
              terminalConfig.panels.map(({ type, name }, index) => {
                const selected = tabIndex === index;

                return (
                  <li key={index}>
                    <button
                      className={classNames('group h-full px-4 flex items-center gap-1.5 whitespace-nowrap text-sm position-relative border-r border-tk-elements-panel-headerTab-borderColor', {
                        'bg-tk-elements-panel-headerTab-backgroundColor text-tk-elements-panel-headerTab-textColor hover:bg-tk-elements-panel-headerTab-backgroundColorHover hover:text-tk-elements-panel-headerTab-textColorHover hover:border-tk-elements-panel-headerTab-borderColorHover': !selected,
                        'bg-tk-elements-panel-headerTab-backgroundColorActive text-tk-elements-panel-headerTab-textColorActive border-tk-elements-panel-headerTab-borderColorActive': selected,
                        'shadow-[0px_1px_0px_0px] shadow-tk-elements-panel-headerTab-backgroundColorActive': selected,
                        'border-l': index > 0
                      })}
                      title={name}
                      aria-selected={selected}
                      onClick={() => setTabIndex(index) }
                    >
                      <span className={classNames(`text-tk-elements-panel-headerTab-iconColor ${ICON_MAP.get(type) ?? ''}`, {
                        'group-hover:text-tk-elements-panel-headerTab-iconColorHover': !selected,
                        'text-tk-elements-panel-headerTab-iconColorActive': selected
                      })}></span>
                      {name}
                    </button>
                  </li>
                )
              })
            }
          </ul>
        </div>
      </div>
      <div className="h-full overflow-hidden">
        {
          domLoaded &&
            <Suspense>
            {
              terminalConfig.panels.map(({ type }, index) => (
                <Terminal
                  key={index}
                  className={tabIndex !== index ? 'hidden' : ''}
                  theme={theme}
                  readonly={type === 'output'}
                  onTerminalReady={(terminal) => {
                    if (type === 'output') {
                      tutorialRunner.attachOutputPanel(terminal);
                    } else {
                      tutorialRunner.attachTerminal(terminal);
                    }
                  }}
                  onTerminalResize={(cols, rows) => {
                    tutorialRunner.onTerminalResize(cols, rows);
                  }}
                />
              ))
            }
            </Suspense>
         }
      </div>
    </div>
  );
}
