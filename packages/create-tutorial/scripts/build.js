import { rm } from 'node:fs/promises';
import { execa } from 'execa';

await rm('dist', { recursive: true, force: true });
await execa('tsc', ['-b'], { stdio: 'inherit', preferLocal: true });
