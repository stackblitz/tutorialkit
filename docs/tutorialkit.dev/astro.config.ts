import react from '@astrojs/react';
import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';
import starlightLinksValidator from 'starlight-links-validator';
import UnoCSS from 'unocss/astro';

// https://astro.build/config
export default defineConfig({
  site: 'https://tutorialkit.dev',
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
  vite: {
    ssr: {
      noExternal: '@tutorialkit/react',
    },
  },
  integrations: [
    react(),
    UnoCSS(),
    starlight({
      title: 'Create interactive coding tutorials',
      social: {
        github: 'https://github.com/stackblitz/tutorialkit',
        'x.com': 'https://x.com/stackblitz',
        discord: 'https://discord.com/invite/stackblitz',
      },
      components: {
        Head: './src/components/Layout/Head.astro',
      },
      customCss: ['./src/styles/custom.scss'],
      logo: {
        dark: './src/assets/brand/tutorialkit-logo-dark.svg',
        light: './src/assets/brand/tutorialkit-logo-light.svg',
        replacesTitle: true,
      },
      plugins: [starlightLinksValidator()],
      sidebar: [
        {
          label: 'Guides',
          items: [
            // each item here is one entry in the navigation menu
            {
              label: 'About',
              link: '/guides/about/',
            },
            {
              label: 'Installation',
              link: '/guides/installation/',
            },
            {
              label: 'Content creation',
              link: '/guides/creating-content/',
            },
            {
              label: 'Deployment',
              link: '/guides/deployment/',
            },
            {
              label: 'User Interface Reference',
              link: '/guides/ui/',
            },
            {
              label: 'Overriding Components',
              link: '/guides/overriding-components/',
            },
            {
              label: 'How to use TutorialKit API',
              link: '/guides/how-to-use-tutorialkit-api/',
            },
          ],
        },
        {
          label: 'Reference',
          items: [
            {
              label: 'Configuration',
              link: '/reference/configuration/',
            },
            {
              label: 'Theming',
              link: '/reference/theming/',
            },
            {
              label: 'React Components',
              link: '/reference/react-components',
            },
            {
              label: 'TutorialKit API',
              link: '/reference/tutorialkit-api',
            },
          ],
        },
      ],
      tableOfContents: {
        maxHeadingLevel: 5,
      },
    }),
  ],
});
