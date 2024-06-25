import fs from 'node:fs/promises';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, test, vi } from 'vitest';
import { FilesMapCache } from './cache.js';

const tmpDir = path.join(__dirname, `.tmp-${path.basename(__filename)}`);

beforeEach(async () => {
  await fs.rm(tmpDir, { force: true, recursive: true });
  await fs.mkdir(tmpDir);
});

afterEach(async () => {
  await fs.rm(tmpDir, { force: true, recursive: true });
});

describe('FilesMapCache', () => {});
