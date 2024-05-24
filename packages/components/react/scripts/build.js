import { cp } from 'fs/promises';
import { spawnSync } from 'child_process';
import { join } from 'path';
import glob from 'fast-glob';

// build everything with typescript
spawnSync('tsc', ['-b'], { stdio: 'inherit' });

// copy css files unmodified
const filePaths = await glob(`./src/**/*.css`, {
  onlyFiles: true,
});

await Promise.all(filePaths.map((filePath) => cp(filePath, join('./dist', filePath.slice(6)))));
