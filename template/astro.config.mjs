import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';
import expressiveCode from 'astro-expressive-code';
import { defineConfig } from 'astro/config';
import remarkDirective from 'remark-directive';
import UnoCSS from 'unocss/astro';
import { remarkAsides } from './src/remark';
import ViteRestart from 'vite-plugin-restart';

export default defineConfig({
  vite: {
    plugins: [ViteRestart({ restart: './src/remark/**' })],
  },
  markdown: {
    remarkPlugins: [remarkDirective, remarkAsides()],
  },
  integrations: [
    react(),
    expressiveCode({
      plugins: [pluginCollapsibleSections(), pluginLineNumbers()],
      themes: ['dark-plus', 'light-plus'],
      styleOverrides: {
        frames: {
          shadowColor: 'none',
        },
      },
    }),
    mdx(),
    UnoCSS({
      injectReset: true,
    }),
  ],
});
