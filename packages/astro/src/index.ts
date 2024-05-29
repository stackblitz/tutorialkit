import type { AstroConfig, AstroIntegration } from 'astro';
import { fileURLToPath } from 'node:url';
import { updateMarkdownConfig } from './remark/index.js';
import { WebContainerFiles } from './webcontainer-files.js';
import { extraIntegrations } from './integrations.js';

export interface Options {
  /**
   * Whether or not default routes are injected.
   *
   * Set this to false to customize the pages.
   *
   * @default true
   */
  defaultRoutes?: boolean;

  /**
   * The value of the Cross-Origin-Embedder-Policy header for the dev server.
   * This is required for webcontainer to works.
   *
   * Using credentialless lets you embed images from third party more easily.
   * However only Firefox and Chrome supports credentialless.
   *
   * @see https://webcontainers.io/guides/configuring-headers
   *
   * @default 'credentialless'
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
      'astro:config:setup'(options) {
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
              include: ['@tutorialkit/components-react'],
            },
            define: {
              __ENTERPRISE__: `${!!enterprise}`,
              __WC_CONFIG__: enterprise ? JSON.stringify(enterprise) : 'undefined',
            },
          },
        });

        updateMarkdownConfig(options);

        updateConfig({
          vite: {
            ssr: {
              noExternal: ['@tutorialkit/astro', '@tutorialkit/components-react'],
            },
          },
        });

        if (defaultRoutes) {
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
        }

        // inject the additional integrations right after ours
        const selfIndex = config.integrations.findIndex((integration) => integration.name === '@tutorialkit/astro');
        config.integrations.splice(selfIndex + 1, 0, ...extraIntegrations());
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
