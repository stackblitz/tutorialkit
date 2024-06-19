import { describe, it, expect } from 'vitest';
import { TerminalConfig } from './terminal-config.js';

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
    expect(config.panels[0].title).toBe('Output');
  });

  it('should have only output panel when config is undefined', () => {
    const config = new TerminalConfig();

    expect(config.panels.length).toBe(1);
    expect(config.panels[0].title).toBe('Output');
  });

  it('should have panels with custom names', () => {
    const config = new TerminalConfig({
      panels: [
        ['output', 'Foo'],
        ['terminal', 'Bar'],
      ],
    });

    expect(config.panels[0].title).toBe('Foo');
    expect(config.panels[1].title).toBe('Bar');
  });

  it('should have panels with custom names and ids', () => {
    const config = new TerminalConfig({
      panels: [
        { type: 'terminal', title: 'Foo', id: 'foo' },
        { type: 'terminal', title: 'Bar', id: 'bar' },
      ],
    });

    expect(config.panels[0].title).toBe('Foo');
    expect(config.panels[0].id).toBe('foo');
    expect(config.panels[0].processOptions).toEqual({
      allowRedirects: false,
      allowCommands: undefined,
    });
    expect(config.panels[1].title).toBe('Bar');
    expect(config.panels[1].id).toBe('bar');
    expect(config.panels[1].processOptions).toEqual({
      allowRedirects: false,
      allowCommands: undefined,
    });
  });

  it('should allow redirects and only allow certain commands when providing a panel type', () => {
    const config = new TerminalConfig({
      allowRedirects: true,
      allowCommands: ['echo'],
      panels: 'terminal',
    });

    expect(config.panels[0].title).toBe('Terminal');
    expect(config.panels[0].processOptions).toEqual({
      allowRedirects: true,
      allowCommands: ['echo'],
    });
  });

  it('should allow redirects and only allow certain commands when providing a list of panel types', () => {
    const config = new TerminalConfig({
      allowRedirects: true,
      allowCommands: ['echo'],
      panels: ['terminal', 'terminal', 'output'],
    });

    expect(config.panels[0].title).toBe('Terminal');
    expect(config.panels[0].processOptions).toEqual({
      allowRedirects: true,
      allowCommands: ['echo'],
    });

    expect(config.panels[1].title).toBe('Terminal 1');
    expect(config.panels[1].processOptions).toEqual({
      allowRedirects: true,
      allowCommands: ['echo'],
    });

    expect(config.panels[2].title).toBe('Output');
    expect(config.panels[2].processOptions).toBeUndefined();
  });

  it('should allow redirects and only allow certain commands when providing a list of panel tuples', () => {
    const config = new TerminalConfig({
      allowRedirects: true,
      allowCommands: ['echo'],
      panels: [
        ['terminal', 'TERM 1'],
        ['terminal', 'TERM 2'],
        ['output', 'OUT'],
      ],
    });

    expect(config.panels[0].title).toBe('TERM 1');
    expect(config.panels[0].processOptions).toEqual({
      allowRedirects: true,
      allowCommands: ['echo'],
    });

    expect(config.panels[1].title).toBe('TERM 2');
    expect(config.panels[1].processOptions).toEqual({
      allowRedirects: true,
      allowCommands: ['echo'],
    });

    expect(config.panels[2].title).toBe('OUT');
    expect(config.panels[2].processOptions).toBeUndefined();
  });

  it('should allow redirects and only allow certain commands when providing a list of panel objects', () => {
    const config = new TerminalConfig({
      allowRedirects: true,
      allowCommands: ['echo'],
      panels: [
        { type: 'terminal', title: 'TERM 1' },
        { type: 'terminal', title: 'TERM 2' },
        { type: 'output', title: 'OUT' },
      ],
    });

    expect(config.panels[0].title).toBe('TERM 1');
    expect(config.panels[0].processOptions).toEqual({
      allowRedirects: true,
      allowCommands: ['echo'],
    });

    expect(config.panels[1].title).toBe('TERM 2');
    expect(config.panels[1].processOptions).toEqual({
      allowRedirects: true,
      allowCommands: ['echo'],
    });

    expect(config.panels[2].title).toBe('OUT');
    expect(config.panels[2].processOptions).toBeUndefined();
  });

  it('should allow overwriting `allowRedirects` and `allowCommands` per panel', () => {
    const config = new TerminalConfig({
      allowRedirects: true,
      allowCommands: ['echo'],
      panels: [
        { type: 'terminal', title: 'TERM 1', allowRedirects: false },
        { type: 'terminal', title: 'TERM 2', allowCommands: ['ls'] },
        { type: 'output', title: 'OUT', allowRedirects: false },
      ],
    });

    expect(config.panels[0].title).toBe('TERM 1');
    expect(config.panels[0].processOptions).toEqual({
      allowRedirects: false,
      allowCommands: ['echo'],
    });

    expect(config.panels[1].title).toBe('TERM 2');
    expect(config.panels[1].processOptions).toEqual({
      allowRedirects: true,
      allowCommands: ['ls'],
    });

    expect(config.panels[2].title).toBe('OUT');
    expect(config.panels[2].processOptions).toBeUndefined();
  });

  it('should have panels and activePanel with inferred names', () => {
    const config = new TerminalConfig({
      panels: ['output', 'terminal', 'terminal'],
    });

    expect(config.panels[0].title).toBe('Output');
    expect(config.panels[1].title).toBe('Terminal');
    expect(config.panels[2].title).toBe('Terminal 1');
  });
});
