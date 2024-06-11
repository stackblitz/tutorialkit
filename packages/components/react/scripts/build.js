import { spawnSync } from 'child_process';
import fastGlob from 'fast-glob';
import { cp } from 'fs/promises';
import { join } from 'path';

spawnSync('ls', ['node_modules'], { stdio: 'inherit' });
spawnSync('ls', ['node_modules/.bin'], { stdio: 'inherit' });
spawnSync('pwd', { stdio: 'inherit' });

// build everything with typescript
const { status, error } = spawnSync('pnpm', ['exec', 'tsc', '-b'], { stdio: 'inherit' });

if (error) {
  console.error(error);
  process.exit(1);
}

if (status !== 0) {
  process.exit(status);
}

// copy css files unmodified
const filePaths = fastGlob.globSync(`./src/**/*.css`, {
  onlyFiles: true,
});

await Promise.all(filePaths.map((filePath) => cp(filePath, join('./dist', filePath.slice(6)))));
