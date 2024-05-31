import type { ITerminal } from "./webcontainer/shell";

/**
 * The output of the tutorial could be written to multiple output panels. This class contains a list of all the panels
 * it needs to write the output to so it's easier to write data to all panels at once.
 */
export class Output {
  private _terminals: ITerminal[] = [];
  private _cols = 0;
  private _rows = 0;

  get cols() {
    return this._cols;
  }

  get rows() {
    return this._rows;
  }

  register(terminal: ITerminal) {
    this._terminals.push(terminal);
  }

  resize(cols: number, rows: number) {
    this._cols = cols;
    this._rows = rows;
  }

  write(data: string) {
    for (const terminal of this._terminals) {
      terminal.write(data);
    }
  }

  reset() {
    for (const terminal of this._terminals) {
      terminal.reset();
    }
  }
}
