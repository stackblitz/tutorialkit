import type { TerminalSchema } from '@tutorialkit/types';
import { WebContainer, auth } from '@webcontainer/api';
import { atom } from 'nanostores';
import { tick } from '../utils/promises.js';
import { isWebContainerSupported } from '../utils/support.js';
import { clearTerminal, escapeCodes, type ITerminal } from '../utils/terminal.js';
import { newJSHProcess } from '../webcontainer/shell.js';
import { TerminalConfig, TerminalPanel } from '../webcontainer/terminal-config.js';

export class TerminalStore {
  terminalConfig = atom<TerminalConfig>(new TerminalConfig());

  private _output: ITerminal | undefined = undefined;
  private _webcontainerLoaded = false;

  constructor(
    private _webcontainer: Promise<WebContainer>,
    private _useAuth: boolean,
  ) {
    this._webcontainer.then(() => {
      this._webcontainerLoaded = true;
    });
  }

  getOutputPanel(): ITerminal | undefined {
    return this._output;
  }

  hasTerminalPanel() {
    return this.terminalConfig.get().panels.length > 0;
  }

  setTerminalConfiguration(config?: TerminalSchema) {
    const oldTerminalConfig = this.terminalConfig.get();
    const newTerminalConfig = new TerminalConfig(config);

    // iterate over the old terminal config and make a list of all terminal panels
    const panelMap = new Map<string, TerminalPanel>(oldTerminalConfig.panels.map((panel) => [panel.id, panel]));

    // iterate over the new terminal panels and try to re-use the old terminal with the new panel
    for (const panel of newTerminalConfig.panels) {
      const oldPanel = panelMap.get(panel.id);

      panelMap.delete(panel.id);

      if (oldPanel?.terminal) {
        // if we found a previous panel with the same id, attach that terminal to the new panel
        panel.attachTerminal(oldPanel.terminal);
      }

      if (panel.type === 'output') {
        this._output = panel;
      }

      if (panel.type === 'terminal' && !oldPanel) {
        // if the panel is a terminal panel, and this panel didn't exist before, spawn a new JSH process
        this._bootWebContainer(panel)
          .then(async (webcontainerInstance) => {
            panel.attachProcess(await newJSHProcess(webcontainerInstance, panel, panel.processOptions));
          })
          .catch(() => {
            // do nothing
          });
      }
    }

    // kill all old processes which we couldn't re-use
    for (const panel of panelMap.values()) {
      panel.process?.kill();
    }

    this.terminalConfig.set(newTerminalConfig);
  }

  /**
   * Attaches the provided terminal with the panel matching the provided ID.
   *
   * @param id The ID of the panel to attach the terminal with.
   * @param terminal The terminal to hook up to the JSH process.
   */
  async attachTerminal(id: string, terminal: ITerminal) {
    const panel = this.terminalConfig.get().panels.find((panel) => panel.id === id);

    if (!panel) {
      // if we don't have a panel with the provided id, just exit
      return;
    }

    panel.attachTerminal(terminal);
  }

  onTerminalResize(cols: number, rows: number) {
    // iterate over all terminal panels and resize all processes
    for (const panel of this.terminalConfig.get().panels) {
      panel.process?.resize({ cols, rows });
    }
  }

  private async _bootWebContainer(terminal: ITerminal) {
    validateWebContainerSupported(terminal);

    const isLoaded = this._webcontainerLoaded;

    if (this._useAuth && !isLoaded) {
      terminal.write('Waiting for authentication to complete...');

      await auth.loggedIn();

      clearTerminal(terminal);
    }

    if (!isLoaded) {
      terminal.write('Booting WebContainer...');
    }

    try {
      const webcontainerInstance = await this._webcontainer;

      if (!isLoaded) {
        clearTerminal(terminal);
      }

      return webcontainerInstance;
    } catch (error) {
      clearTerminal(terminal);

      await tick();

      terminal.write(
        [
          escapeCodes.red(`Looks like your browser's configuration is blocking WebContainers.`),
          '',
          `Let's troubleshoot this!`,
          '',
          'Read more at:',
          'https://webcontainers.io/guides/browser-config',
          '',
        ].join('\n'),
      );

      throw error;
    }
  }
}

function validateWebContainerSupported(terminal: ITerminal) {
  if (!isWebContainerSupported()) {
    terminal.write(
      [
        escapeCodes.red('Incompatible Web Browser'),
        '',
        `WebContainers currently work in Chromium-based browsers, Firefox, and Safari 16.4. We're hoping to add support for more browsers as they implement the necessary Web Platform features.`,
        '',
        'Read more about browser support:',
        'https://webcontainers.io/guides/browser-support',
        '',
      ].join('\n'),
    );

    throw new Error('Incompatible Web Browser');
  }
}
