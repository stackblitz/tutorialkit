#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const tutorialKitEntryPoint = require.resolve('@tutorialkit/cli');

spawnSync('node', [tutorialKitEntryPoint, 'create', ...process.argv.slice(2)], { stdio: 'inherit' });
