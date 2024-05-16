import type { AstroIntegration } from 'astro';
import fs from 'node:fs';

export const tutorialkit: AstroIntegration = {
  name: 'tutorialkit',
  hooks: {
    'astro:config:setup'({ config, updateConfig, addWatchFile, logger }) {
      const configPath = new URL('tutorialkit.config.json', config.root);

      const setDefaultConfig = () =>
        updateConfig({
          vite: {
            define: {
              __ENTERPRISE__: 'false',
              __WC_CONFIG__: 'undefined',
            },
          },
        });

      addWatchFile(configPath);

      if (!fs.existsSync(configPath)) {
        setDefaultConfig();

        return;
      }

      try {
        const tutorialKitConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

        updateConfig({
          vite: {
            define: {
              __ENTERPRISE__: `${!!tutorialKitConfig.enterprise}`,
              __WC_CONFIG__: tutorialKitConfig.enterprise ? JSON.stringify(tutorialKitConfig.enterprise) : 'undefined',
            },
          },
        });
      } catch (error) {
        logger.error(`Invalid TutorialKit configuration!`);
        console.error(error);

        setDefaultConfig();
      }
    },
  },
};
