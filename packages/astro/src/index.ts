import { fileURLToPath } from 'node:url';
import type { AstroConfig, AstroIntegration } from 'astro';
import type { ExpressiveCodePlugin } from 'astro-expressive-code';
import { extraIntegrations } from './integrations.js';
import { updateMarkdownConfig } from './remark/index.js';
import { tutorialkitCore } from './vite-plugins/core.js';
import { userlandCSS, watchUserlandCSS } from './vite-plugins/css.js';
import { overrideComponents, type OverrideComponentsOptions } from './vite-plugins/override-components.js';
import { tutorialkitStore } from './vite-plugins/store.js';
import { WebContainerFiles } from './webcontainer-files/index.js';

export interface Options {
  /**
   * Whether or not default routes are injected.
   *
   * Set this to false to customize the pages.
   *
   * Use 'tutorial-only' to only inject the tutorial routes. This is useful
   * if you want to have a different landing page.
   *
   * @default true
   */
  defaultRoutes?: boolean | 'tutorial-only';

  /**
   * Override components of TutorialKit.
   */
  components?: OverrideComponentsOptions;

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

  /**
   * Expressive code plugins.
   *
   * @default []
   */
  expressiveCodePlugins?: ExpressiveCodePlugin[];
}

export default function createPlugin({
  defaultRoutes = true,
  components,
  isolation,
  enterprise,
  expressiveCodePlugins = [],
}: Options = {}): AstroIntegration {
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
              include: process.env.TUTORIALKIT_DEV
                ? []
                : [
                    '@tutorialkit/react',

                    /**
                     * The `picomatch` is CJS dependency used by `@tutorialkit/runtime`.
                     * When used via `@tutorialkit/astro`, it's a transitive dependency that's
                     * not automatically transformed.
                     */
                    '@tutorialkit/astro > picomatch/posix.js',
                  ],
            },
            define: {
              __ENTERPRISE__: `${!!enterprise}`,
              __WC_CONFIG__: enterprise ? JSON.stringify(enterprise) : 'undefined',
            },
            ssr: {
              noExternal: ['@tutorialkit/astro', '@tutorialkit/react'],
            },
            plugins: [
              userlandCSS,
              tutorialkitStore,
              tutorialkitCore,
              overrideComponents({ components, defaultRoutes: !!defaultRoutes }),
              process.env.TUTORIALKIT_VITE_INSPECT ? (await import('vite-plugin-inspect')).default() : null,
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
        config.integrations.splice(
          selfIndex + 1,
          0,
          ...extraIntegrations({ root: fileURLToPath(config.root), expressiveCodePlugins }),
        );
      },
      'astro:config:done'({ config }) {
        _config = config;
      },
      async 'astro:server:setup'(options) {
        if (!_config) {
          return;
        }

        const { server, logger } = options;
        const projectRoot = fileURLToPath(_config.root);

        await webcontainerFiles.serverSetup(projectRoot, options);

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
