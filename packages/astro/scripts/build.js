import { spawnSync } from 'node:child_process';
import { cp, rm } from 'node:fs/promises';

// clean dist
await rm('dist', { recursive: true, force: true });

// build everything with typescript
spawnSync('tsc', ['-b'], { stdio: 'inherit' });

// delete transpiled files by typescript that we don't want
await rm('dist/default', { recursive: true });

// copy default folder unmodified
await cp('./src/default', './dist/default', { recursive: true });
