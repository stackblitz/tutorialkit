import fs from 'node:fs';
import { templateDest } from './_constants.js';
import { success } from './logger.js';

fs.rmSync(templateDest, { recursive: true, force: true });

success('Cleaned up');
