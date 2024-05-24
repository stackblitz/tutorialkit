import type { AstroConfig, AstroIntegration } from 'astro';
import { fileURLToPath } from 'node:url';
import { updateConfigFromTutorialKitConfig } from './config';
import { updateMarkdownConfig } from './remark';
import { WebContainerFiles } from './webcontainer-files';

interface Options {
  /**
   * Whether or not default routes are injected.
   *
   * Set this to false to customize the pages.
   *
   * @default true
   */
  defaultRoutes?: boolean;
}

export default function createPlugin({ defaultRoutes = true }: Options = {}): AstroIntegration {
  const webcontainerFiles = new WebContainerFiles();

  let _config: AstroConfig;

  return {
    name: '@tutorialkit/astro',
    hooks: {
      'astro:config:setup'(options) {
        const { injectRoute } = options;

        updateConfigFromTutorialKitConfig(options);
        updateMarkdownConfig(options);

        injectRoute({
          pattern: '/',
          entrypoint: '@tutorialkit/astro/default/pages/index.astro',
          prerender: true,
        });

        injectRoute({
          pattern: '[...slug]',
          entrypoint: '@tutorialkit/astro/default/pages/[...slug].astro',
          prerender: true,
        });
      },
      'astro:config:done'({ config }) {
        _config = config;
      },
      'astro:server:setup'(astroServerSetupOptions) {
        const projectRoot = fileURLToPath(_config.root);

        webcontainerFiles.serverSetup(projectRoot, astroServerSetupOptions);
      },
      async 'astro:server:done'() {
        await webcontainerFiles.serverDone();
      },
      async 'astro:build:done'(astroBuildDoneOptions) {
        const projectRoot = fileURLToPath(_config.root);

        await webcontainerFiles.buildAssets(projectRoot, astroBuildDoneOptions);
      },
    },
  };
}
