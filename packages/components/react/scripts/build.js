import { spawnSync } from 'child_process';
import fastGlob from 'fast-glob';
import { cp } from 'fs/promises';
import { join } from 'path';

// build everything with typescript
spawnSync('node_modules/.bin/tsc', ['-b'], { stdio: 'inherit' });

// copy css files unmodified
const filePaths = fastGlob.globSync(`./src/**/*.css`, {
  onlyFiles: true,
});

await Promise.all(filePaths.map((filePath) => cp(filePath, join('./dist', filePath.slice(6)))));
