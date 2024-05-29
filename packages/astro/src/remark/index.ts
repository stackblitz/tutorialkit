import path from 'node:path';
import remarkDirective from 'remark-directive';
import type { AstroConfigSetupOptions } from '../types.js';
import { remarkCalloutsPlugin } from './callouts.js';
import { remarkImportFilePlugin } from './import-file.js';

export function updateMarkdownConfig({ updateConfig }: AstroConfigSetupOptions) {
  updateConfig({
    markdown: {
      remarkPlugins: [
        remarkDirective,
        remarkCalloutsPlugin(),
        remarkImportFilePlugin({ templatesPath: path.join(process.cwd(), 'src/templates') }),
      ],
    },
  });
}
