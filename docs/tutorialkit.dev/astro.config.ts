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
              label: 'Creating a Lesson',
              link: '/guides/creating-content/',
            },
            {
              label: 'Configuration',
              link: '/guides/configuration/',
            },
            {
              label: 'Deployment',
              link: '/guides/deployment/',
            },
            {
              label: 'User Interface Reference',
              link: '/guides/ui/',
            },
          ],
        },
        {
          label: 'Theming',
          link: '/theming/',
        },
      ],
      tableOfContents: {
        maxHeadingLevel: 5,
      },
    }),
  ],
});
