import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const outDir = 'dist';
export const templatePath = path.join(__dirname, '../../template');
export const templateDest = path.join(__dirname, '../template');
export const distFolder = path.join(__dirname, '..', outDir);
export const overwritesFolder = path.join(__dirname, '../overwrites');
