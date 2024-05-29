import assert from 'node:assert';
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { cp, rm } from 'node:fs/promises';

// clean dist
await rm('dist', { recursive: true, force: true });

// build everything with typescript
spawnSync('tsc', ['--project', './tsconfig.build.json'], { stdio: 'inherit' });

if (existsSync('./dist/default')) {
  assert.fail('TypeScript transpiled the default folder, it means that the tsconfig has an issue');
}

// copy default folder unmodified
await cp('./src/default', './dist/default', { recursive: true });
