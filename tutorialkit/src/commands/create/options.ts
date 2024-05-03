import path from 'node:path';
import { fileURLToPath } from 'node:url';

export interface CreateOptions {
  _: Array<string | number>;
  install?: boolean;
  git?: boolean;
  dir?: string;
  dryRun?: boolean;
  defaults?: boolean;
  packageManager?: string;
  force?: boolean;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const templatePath = path.resolve(__dirname, process.env.TUTORIALKIT_TEMPLATE_PATH ?? '../_template');

export const DEFAULT_VALUES = {
  git: true,
  install: true,
  dryRun: false,
  force: false,
  packageManager: 'npm',
};
