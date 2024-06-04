import type { TerminalSchema } from '@tutorialkit/types';
import type { WebContainerProcess } from '@webcontainer/api';
import type { ITerminal } from '../terminal.js';

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

let globalId = 0;

/**
 * This class contains the state for a terminal panel. This is a panel which is attached to a process and renders
 * the process output to a screen.
 */
export class TerminalPanel implements ITerminal {
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
  readonly id: string;

  private _terminal?: ITerminal;
  private _process?: WebContainerProcess;
  private _data: string[] = [];
  private _onData?: (data: string) => void;

  constructor(
    readonly type: TerminalPanelType,
    name?: string
  ) {
    // automatically infer a name if no name is provided
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
    this.id = type === 'output' ? 'output' : `${type}-${globalId++}`;
  }

  get terminal() {
    return this._terminal;
  }

  get process() {
    return this._process;
  }

  // #region ITerminal methods
  get cols() {
    // we fallback to a default
    return this._terminal?.cols;
  }

  get rows() {
    return this._terminal?.rows;
  }

  reset() {
    if (this._terminal) {
      this._terminal.reset();
    } else {
      this._data = [];
    }
  }

  write(data: string) {
    if (this._terminal) {
      this._terminal.write(data);
    } else {
      this._data.push(data);
    }
  }

  onData(callback: (data: string) => void) {
    if (this._terminal) {
      this._terminal.onData(callback)
    } else {
      this._onData = callback;
    }
  }
  // #endregion

  /**
   * Attach a WebContainer process to this panel.
   *
   * @param process The WebContainer process
   */
  attachProcess(process: WebContainerProcess) {
    this._process = process;

    if (this.cols != null && this.rows != null) {
      this._process.resize({ cols: this.cols, rows: this.rows });
    }
  }

  /**
   * Attach a terminal to this panel.
   *
   * @param terminal The terminal.
   */
  attachTerminal(terminal: ITerminal) {
    for (const data of this._data) {
      terminal.write(data);
    }

    this._data = [];
    this._terminal = terminal;

    if (this._onData) {
      terminal.onData(this._onData);
    }

    if (this.cols != null && this.rows != null) {
      this._process?.resize({ cols: this.cols, rows: this.rows });
    }
  }
}

/**
 * Normalize the provided configuration to a configuration which is easier to parse.
 *
 * @param config The terminal configuration.
 * @returns A normalized terminal configuration.
 */
function normalizeTerminalConfig(config?: TerminalSchema): NormalizedTerminalConfig {
  // reset the count so that the auto-infered names are indexed properly
  TerminalPanel.resetCount();

  let activePanel = 0;

  // if no config is set, we just render the output panel
  if (config === undefined) {
    return {
      panels: [new TerminalPanel('output')],
      activePanel,
    };
  }

  // if the config is `true`, we add a single terminal
  if (typeof config === 'boolean') {
    const panels = [new TerminalPanel('output')];

    if (config) {
      panels.push(new TerminalPanel('terminal'));
    }

    return {
      panels,
      activePanel
    };
  }

  const panels: TerminalPanel[] = [];

  if (config.panels && config.panels !== 'output') {
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
