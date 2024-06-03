export type PanelType = 'terminal' | 'output';

export type TerminalConfig = boolean | {
  panels?: PanelType | PanelType[] | Array<[PanelType, string]>;
  activePanel?: number;
}

export type NormalizedTerminalConfig = {
  panels: Array<[PanelType, string]>;
  activePanel: number;
}

/**
 * Normalizes the terminal config so that it's always an object with the same properties.
 *
 * @param config The input configuration.
 * @returns The normalized configuration.
 */
export function normalizeTerminalConfig(config?: TerminalConfig): NormalizedTerminalConfig {
  let activePanel = 0;

  let panels: Array<[PanelType, string]> = [
    ['output', 'Output']
  ];

  // if no config is set, we just render the output panel
  if (config === undefined) {
    return {
      panels,
      activePanel,
    };
  }

  // if the config is `true`, we add a single terminal
  if (typeof config === 'boolean') {
    if (config) {
      panels.push(['terminal', 'Terminal']);
    }

    return {
      panels,
      activePanel
    };
  }

  if (config.panels && config.panels !== 'output') {
    // clear the default output panel
    panels = [];

    if (config.panels === 'terminal') {
      panels.push(['terminal', 'Terminal']);
    } else if (Array.isArray(config.panels)) {
      // keep track of how many panels we have without a name
      const panelCount: Record<PanelType, number> = {
        output: 0,
        terminal: 0,
      };

      for (const panel of config.panels) {
        const [type, name] = Array.isArray(panel) ? panel : [panel];

        if (!name) {
          let inferredName = type === 'output' ? 'Output' : 'Terminal';

          if (panelCount[type] > 0) {
            inferredName += ` ${panelCount[type]}`;
          }

          panels.push([type, inferredName]);
        } else {
          panels.push([type, name]);
        }

        panelCount[type]++;
      }
    }
  }

  if (typeof config.activePanel === 'number') {
    activePanel = config.activePanel;

    if (activePanel >= panels.length) {
      activePanel = 0;
    }
  }

  return {
    activePanel,
    panels,
  };
}
