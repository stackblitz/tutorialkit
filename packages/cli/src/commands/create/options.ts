import path from 'node:path';
import { fileURLToPath } from 'node:url';

export interface CreateOptions {
  _: Array<string | number>;
  install?: boolean;
  start?: boolean;
  git?: boolean;
  enterprise?: string;
  dir?: string;
  dryRun?: boolean;
  defaults?: boolean;
  packageManager?: string;
  force?: boolean;
  provider?: string;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const templatePath = path.resolve(__dirname, process.env.TUTORIALKIT_TEMPLATE_PATH ?? '../_template');

export const DEFAULT_VALUES = {
  git: !process.env.CI,
  install: true,
  start: true,
  dryRun: false,
  force: false,
  packageManager: 'npm',
  provider: 'skip',
};

type Flags = Omit<CreateOptions, '_'>;

export function readFlag<Flag extends keyof Flags>(flags: Flags, flag: Flag): Flags[Flag] {
  let value = flags[flag];

  if (flags.defaults) {
    value ??= (DEFAULT_VALUES as Flags)[flag];
  }

  return value;
}
