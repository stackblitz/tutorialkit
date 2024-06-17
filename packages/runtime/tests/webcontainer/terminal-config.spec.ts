import { describe, it, expect } from 'vitest';
import { TerminalConfig } from '../../src/webcontainer/terminal-config.js';

describe('TerminalConfig', () => {
  it('should have panels and activePanel', () => {
    const config = new TerminalConfig({
      panels: ['output', 'terminal'],
      activePanel: 1,
    });

    expect(config.panels.length).toBe(2);
    expect(config.activePanel).toBe(1);
  });

  it('should have no panels when config is false', () => {
    const config = new TerminalConfig(false);

    expect(config.panels.length).toBe(0);
  });

  it('should have only output panel when config is true', () => {
    const config = new TerminalConfig(true);

    expect(config.panels.length).toBe(1);
    expect(config.panels[0].name).toBe('Output');
  });

  it('should have only output panel when config is undefined', () => {
    const config = new TerminalConfig();

    expect(config.panels.length).toBe(1);
    expect(config.panels[0].name).toBe('Output');
  });

  it('should have panels with custom names', () => {
    const config = new TerminalConfig({
      panels: [
        ['output', 'Foo'],
        ['terminal', 'Bar'],
      ],
    });

    expect(config.panels[0].name).toBe('Foo');
    expect(config.panels[1].name).toBe('Bar');
  });

  it('should have panels with custom names and ids', () => {
    const config = new TerminalConfig({
      panels: [
        ['terminal', { name: 'Foo', id: 'foo' }],
        ['terminal', { name: 'Bar', id: 'bar' }],
      ],
    });

    expect(config.panels[0].name).toBe('Foo');
    expect(config.panels[0].id).toBe('foo');
    expect(config.panels[1].name).toBe('Bar');
    expect(config.panels[1].id).toBe('bar');
  });

  it('should have panels and activePanel with inferred names', () => {
    const config = new TerminalConfig({
      panels: ['output', 'terminal', 'terminal'],
    });

    expect(config.panels[0].name).toBe('Output');
    expect(config.panels[1].name).toBe('Terminal');
    expect(config.panels[2].name).toBe('Terminal 1');
  });
});
