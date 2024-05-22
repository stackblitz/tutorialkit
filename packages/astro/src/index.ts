import type { AstroConfig, AstroIntegration } from 'astro';
import { fileURLToPath } from 'node:url';
import { updateConfigFromTutorialKitConfig } from './config';
import { updateMarkdownConfig } from './remark';
import { WebContainerFiles } from './webcontainer-files';

interface Options {}

export default function createPlugin(options?: Options): AstroIntegration {
  const webcontainerFiles = new WebContainerFiles();

  let _config: AstroConfig;

  return {
    name: 'tutorialkit',
    hooks: {
      'astro:config:setup'(astroConfigSetupOptions) {
        updateConfigFromTutorialKitConfig(astroConfigSetupOptions);
        updateMarkdownConfig(astroConfigSetupOptions);
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
      }
    },
  };
}
