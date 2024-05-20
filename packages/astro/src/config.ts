import type { AstroIntegrationLogger } from 'astro';
import type { AstroConfigSetupOptions } from './types';
import fs from 'node:fs';

interface TutorialKitConfig {
  isolation?: 'require-corp' | 'creddentialless';
  enterprise?: {
    editorOrigin: string;
    clientId: string;
    scope: string;
  };
}

function readTutorialKitConfig(configPath: URL, logger: AstroIntegrationLogger): TutorialKitConfig {
  if (!fs.existsSync(configPath)) {
    return {};
  }

  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (error) {
    logger.error(`Invalid TutorialKit configuration!`);
    console.error(error);

    return {};
  }
}

export function updateConfigFromTutorialKitConfig({
  config,
  addWatchFile,
  updateConfig,
  logger,
}: AstroConfigSetupOptions) {
  const configPath = new URL('tutorialkit.config.json', config.root);
  const tkConfig = readTutorialKitConfig(configPath, logger);

  addWatchFile(configPath);

  updateConfig({
    server: {
      headers: {
        'Cross-Origin-Embedder-Policy': tkConfig?.isolation ?? 'require-corp',
        'Cross-Origin-Opener-Policy': 'same-origin',
      },
    },
    vite: {
      optimizeDeps: {
        entries: ['!**/src/(content|templates)/**'],
      },
      define: {
        __ENTERPRISE__: `${!!tkConfig.enterprise}`,
        __WC_CONFIG__: tkConfig.enterprise ? JSON.stringify(tkConfig.enterprise) : 'undefined',
      },
    },
  });
}
