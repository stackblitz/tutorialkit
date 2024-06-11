import { execa } from 'execa';
import fastGlob from 'fast-glob';
import { cp } from 'fs/promises';
import { join } from 'path';

// build everything with typescript
await execa('tsc', ['-b'], { stdio: 'inherit', preferLocal: true });

// copy css files unmodified
const filePaths = fastGlob.globSync(`./src/**/*.css`, {
  onlyFiles: true,
});

await Promise.all(filePaths.map((filePath) => cp(filePath, join('./dist', filePath.slice(6)))));
