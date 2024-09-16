export class MultiCounter {
  private _counts = new Map<string, number>();

  increment(name: string | string[]) {
    if (typeof name === 'string') {
      const currentValue = this._counts.get(name) ?? 0;

      this._counts.set(name, currentValue + 1);

      return;
    }

    name.forEach((value) => this.increment(value));
  }

  decrement(name: string): boolean {
    const currentValue = this._counts.get(name) ?? 0;

    if (currentValue === 0) {
      return true;
    }

    this._counts.set(name, currentValue - 1);

    return currentValue - 1 === 0;
  }
}
