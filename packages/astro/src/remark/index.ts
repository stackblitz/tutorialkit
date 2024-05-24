import path from 'node:path';
import remarkDirective from 'remark-directive';
import type { AstroConfigSetupOptions } from '../types';
import { remarkCalloutsPlugin } from './callouts';
import { remarkImportFilePlugin } from './import-file';

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
