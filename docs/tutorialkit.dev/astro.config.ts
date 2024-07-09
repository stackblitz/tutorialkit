import react from '@astrojs/react';
import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';
import starlightLinksValidator from 'starlight-links-validator';

// https://astro.build/config
export default defineConfig({
  site: 'https://tutorialkit.dev',
  integrations: [
    react(),
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
          ],
        },
      ],
      tableOfContents: {
        maxHeadingLevel: 5,
      },
    }),
  ],
});
