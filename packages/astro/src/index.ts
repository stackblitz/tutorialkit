import type { AstroConfig, AstroIntegration } from 'astro';
import { fileURLToPath } from 'node:url';
import { extraIntegrations } from './integrations.js';
import { updateMarkdownConfig } from './remark/index.js';
import { WebContainerFiles } from './webcontainer-files.js';
import { userlandCSS, watchUserlandCSS } from './vite-plugins/css.js';
import { tutorialkitStore } from './vite-plugins/store.js';
import { tutorialkitCore } from './vite-plugins/core.js';

export { theme } from './theme.js';

export interface Options {
  /**
   * Whether or not default routes are injected.
   *
   * Set this to false to customize the pages.
   *
   * @default 'all'
   */
  defaultRoutes?: boolean | 'tutorial-only';

  /**
   * The value of the Cross-Origin-Embedder-Policy header for the dev server.
   * This is required for webcontainer to works.
   *
   * Using credentialless lets you embed images from third party more easily.
   * However only Firefox and Chrome supports credentialless.
   *
   * @see https://webcontainers.io/guides/configuring-headers
   *
   * @default 'require-corp'
   */
  isolation?: 'require-corp' | 'credentialless';

  /**
   * Configuration options when using the Enterprise
   * version of WebContainer API.
   */
  enterprise?: {
    /**
     * The StackBlitz editor origin.
     */
    editorOrigin: string;

    /**
     * The client id.
     */
    clientId: string;

    /**
     * The OAuth scope.
     */
    scope: string;
  };
}

export default function createPlugin({ defaultRoutes = true, isolation, enterprise }: Options = {}): AstroIntegration {
  const webcontainerFiles = new WebContainerFiles();

  let _config: AstroConfig;

  return {
    name: '@tutorialkit/astro',
    hooks: {
      async 'astro:config:setup'(options) {
        const { injectRoute, updateConfig, config } = options;

        updateConfig({
          server: {
            headers: {
              'Cross-Origin-Embedder-Policy': isolation ?? 'require-corp',
              'Cross-Origin-Opener-Policy': 'same-origin',
            },
          },
          vite: {
            optimizeDeps: {
              entries: ['!**/src/(content|templates)/**'],
              include: process.env.TUTORIALKIT_DEV ? [] : ['@tutorialkit/components-react'],
            },
            define: {
              __ENTERPRISE__: `${!!enterprise}`,
              __WC_CONFIG__: enterprise ? JSON.stringify(enterprise) : 'undefined',
            },
            ssr: {
              noExternal: ['@tutorialkit/astro', '@tutorialkit/components-react'],
            },
            plugins: [
              userlandCSS,
              tutorialkitStore,
              tutorialkitCore,
              process.env.TUTORIALKIT_DEV ? (await import('vite-plugin-inspect')).default() : null,
            ],
          },
        });

        updateMarkdownConfig(options);

        if (defaultRoutes) {
          if (defaultRoutes !== 'tutorial-only') {
            injectRoute({
              pattern: '/',
              entrypoint: '@tutorialkit/astro/default/pages/index.astro',
              prerender: true,
            });
          }

          injectRoute({
            pattern: '[...slug]',
            entrypoint: '@tutorialkit/astro/default/pages/[...slug].astro',
            prerender: true,
          });
        }

        // inject the additional integrations right after ours
        const selfIndex = config.integrations.findIndex((integration) => integration.name === '@tutorialkit/astro');
        config.integrations.splice(selfIndex + 1, 0, ...extraIntegrations());
      },
      'astro:config:done'({ config }) {
        _config = config;
      },
      'astro:server:setup'(options) {
        if (!_config) {
          return;
        }

        const { server, logger } = options;
        const projectRoot = fileURLToPath(_config.root);

        webcontainerFiles.serverSetup(projectRoot, options);

        watchUserlandCSS(server, logger);
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
