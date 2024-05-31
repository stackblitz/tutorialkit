import type { TerminalSchema } from '@tutorialkit/types';

export type TerminalPanelType = 'output' | 'terminal';

type NormalizedTerminalConfig = {
  panels: TerminalPanel[];
  activePanel: number;
}

export class TerminalConfig {
  private _config: NormalizedTerminalConfig;

  constructor(config?: TerminalSchema) {
    const normalized = normalizeTerminalConfig(config);

    this._config = normalized;
  }

  get panels() {
    return this._config.panels;
  }

  get activePanel() {
    return this._config.activePanel;
  }
}

const TERMINAL_PANEL_NAMES: Record<TerminalPanelType, string> = {
  output: 'Output',
  terminal: 'Terminal'
};

export class TerminalPanel {
  static panelCount: Record<TerminalPanelType, number> = {
    output: 0,
    terminal: 0,
  };

  static resetCount() {
    this.panelCount = {
      output: 0,
      terminal: 0,
    };
  }

  readonly name: string;

  constructor(
    readonly type: TerminalPanelType,
    name?: string
  ) {
    if (!name) {
      name = TERMINAL_PANEL_NAMES[type];

      // we keep track of all unnamed panel and add an index to the name
      const count = TerminalPanel.panelCount[type];

      if (count > 0) {
        name += ` ${count}`;
      }

      TerminalPanel.panelCount[type]++;
    }

    this.name = name;
  }
}

function normalizeTerminalConfig(config?: TerminalSchema): NormalizedTerminalConfig {
  TerminalPanel.resetCount();

  let activePanel = 0;
  let panels: TerminalPanel[] = [new TerminalPanel('output')];

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
      panels.push(new TerminalPanel('terminal'));
    }

    return {
      panels,
      activePanel
    };
  }

  if (config.panels && config.panels !== 'output') {
    TerminalPanel.resetCount();

    // clear the default output panel
    panels = [];

    if (config.panels === 'terminal') {
      panels.push(new TerminalPanel('terminal'));
    } else if (Array.isArray(config.panels)) {
      for (const panel of config.panels) {
        const [type, name] = Array.isArray(panel) ? panel : [panel];

        panels.push(new TerminalPanel(type, name));
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
