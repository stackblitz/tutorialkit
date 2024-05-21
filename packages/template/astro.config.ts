import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';
import expressiveCode from 'astro-expressive-code';
import { defineConfig } from 'astro/config';
import UnoCSS from 'unocss/astro';
import tutorialkit from '@tutorialkitjs/astro';

export default defineConfig({
  devToolbar: {
    enabled: false,
  },
  integrations: [
    tutorialkit(),
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
