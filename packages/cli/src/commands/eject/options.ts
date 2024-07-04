export interface EjectOptions {
  _: Array<string | number>;
  force?: boolean;
  defaults?: boolean;
}

export const DEFAULT_VALUES = {
  force: false,
  defaults: false,
};
