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
    optimizeDeps: {
      entries: ['!**/src/(content|templates)/**'],
    },
    plugins: [
      ViteRestart({ restart: './src/remark/**' }),
      {
        name: 'reloadWebContainer',
        handleHotUpdate(ctx) {
          if (ctx.file.endsWith('/webcontainer/index.ts')) {
            ctx.server.hot.send({ type: 'full-reload' });
            return [];
          }
        },
      },
    ],
  },
  devToolbar: {
    enabled: false,
  },
  markdown: {
    remarkPlugins: [remarkDirective, remarkAsides()],
  },
  integrations: [
    react(),
    expressiveCode({
      plugins: [pluginCollapsibleSections(), pluginLineNumbers()],
      themes: ['dark-plus', 'light-plus'],
      customizeTheme: (theme) => {
        const isDark = theme.type === 'dark';

        theme.styleOverrides = {
          borderColor: 'var(--tk-border-secondary)',
          borderWidth: '1px',
          borderRadius: 'var(--code-border-radius, 0px)',
          frames: {
            terminalTitlebarBackground: `var(--tk-background-${isDark ? 'primary' : 'secondary'})`,
            terminalTitlebarBorderBottomColor: `var(--tk-background-${isDark ? 'primary' : 'secondary'})`,
            editorTabBorderRadius: 'var(--code-border-radius, 0px)',
            editorTabBarBackground: `var(--tk-background-${isDark ? 'primary' : 'secondary'})`,
          },
        };
      },
      themeCssSelector: (theme) => {
        let customThemeName = 'light';

        if (theme.name === 'dark-plus') {
          customThemeName = 'dark';
        }

        return `[data-theme='${customThemeName}']`;
      },
      defaultProps: {
        showLineNumbers: false,
      },
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
