import type { AstroConfigSetupOptions } from '../types';
import remarkDirective from 'remark-directive';
import { remarkCallouts as remarkAsides } from './callouts';

export function updateMarkdownConfig({ updateConfig }: AstroConfigSetupOptions) {
  updateConfig({
    markdown: {
      remarkPlugins: [remarkDirective, remarkAsides()],
    },
  });
}
