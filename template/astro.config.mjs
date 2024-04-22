import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';
import expressiveCode from 'astro-expressive-code';
import { defineConfig } from 'astro/config';
import remarkDirective from 'remark-directive';
import UnoCSS from 'unocss/astro';
import ViteRestart from 'vite-plugin-restart';
import { remarkAsides } from './src/remark';

export default defineConfig({
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
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
      configDeps: ['./theme.ts'],
      injectReset: true,
    }),
  ],
});
