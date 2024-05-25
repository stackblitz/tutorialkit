import type { AstroIntegrationLogger } from 'astro';
import type { AstroConfigSetupOptions } from './types';
import { z, ZodError, type ZodFormattedError } from 'zod';
import fs from 'node:fs';

const configSchema = z
  .object({
    isolation: z.union([z.literal('require-corp'), z.literal('credentialless')]).optional(),
    enterprise: z
      .object({
        editorOrigin: z.string(),
        clientId: z.string(),
        scope: z.string(),
      })
      .optional(),
  })
  .strict();

type TutorialKitConfig = z.infer<typeof configSchema>;

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
        include: ['@tutorialkit/components-react'],
      },
      define: {
        __ENTERPRISE__: `${!!tkConfig.enterprise}`,
        __WC_CONFIG__: tkConfig.enterprise ? JSON.stringify(tkConfig.enterprise) : 'undefined',
      },
    },
  });
}

function readTutorialKitConfig(configPath: URL, logger: AstroIntegrationLogger): TutorialKitConfig {
  if (!fs.existsSync(configPath)) {
    return {};
  }

  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    return configSchema.parse(config);
  } catch (error) {
    if (error instanceof ZodError) {
      logger.error(`Invalid TutorialKit configuration:`);

      printError(logger, error.format());

      return {};
    }

    logger.error(`Invalid TutorialKit configuration!`);
    console.error(error);

    return {};
  }
}

function printError(logger: AstroIntegrationLogger, formattedError: ZodFormattedError<any>, path = '') {
  const prefix = path.length > 0 ? `'${path}': ` : '';

  for (const issue of formattedError._errors) {
    logger.error(` - ${prefix}${issue}`);
  }

  for (const property in formattedError) {
    if (property !== '_errors') {
      const subpath = path.length === 0 ? property : `${path}.${property}`;
      printError(logger, formattedError[property as keyof typeof formattedError] as any, subpath);
    }
  }
}
