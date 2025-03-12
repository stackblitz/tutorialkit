import fs from 'node:fs';
import path from 'node:path';
import * as prompts from '@clack/prompts';
import chalk from 'chalk';
import { warnLabel } from 'src/utils/messages.js';
import { runTask } from 'src/utils/tasks.js';
import { DEFAULT_VALUES, readFlag } from './options.js';
import cloudflareConfigRaw from './hosting-config/_headers.txt?raw';
import netlifyConfigRaw from './hosting-config/netlify_toml.txt?raw';
import vercelConfigRaw from './hosting-config/vercel.json?raw';

export async function generateHostingConfig(dest: string, flags: { dryRun: boolean, provider?: string }) {
  let provider = readFlag(flags, 'provider' as any);
  
  if (provider === undefined) {
    provider = await prompts.select({
      message: 'Select hosting providers for automatic configuration:',
      options: [
        { value: 'Vercel', label: 'Vercel' },
        { value: 'Netlify', label: 'Netlify' },
        { value: 'Cloudflare', label: 'Cloudflare' },
        { value: 'skip', label: 'Skip hosting configuration' },
      ],
      initialValue: DEFAULT_VALUES.provider,
    });
  }

  if (provider === 'skip') {
    prompts.log.message(
      `${chalk.blue('hosting provider config [skip]')} You can configure hosting provider settings manually later. For more information see https://tutorialkit.dev/guides/deployment/#headers-configuration`,
    );
    return;
  }

  prompts.log.info(`${chalk.blue('Hosting Configuration')} Setting up configuration for ${provider}`);

  const resolvedDest = path.resolve(dest);

  if (!fs.existsSync(resolvedDest)) {
    fs.mkdirSync(resolvedDest, { recursive: true });
  }

  let config;
  let filename;

  if (provider.includes('Vercel')) {
    config = typeof vercelConfigRaw === 'string' ? vercelConfigRaw : JSON.stringify(vercelConfigRaw, null, 2);
    filename = 'vercel.json';
  } else if (provider.includes('Netlify')) {
    config = netlifyConfigRaw;
    filename = 'netlify.toml';
  } else if (provider.includes('Cloudflare')) {
    config = cloudflareConfigRaw;
    filename = '_headers';
  }

  if (config && filename) {
    await runTask({
      title: `Create hosting files for ${provider}`,
      dryRun: flags.dryRun,
      dryRunMessage: `${warnLabel('DRY RUN')} Skipped hosting provider config creation`,
      task: async () => {
        const filepath = path.join(resolvedDest, filename);
        fs.writeFileSync(filepath, config);

        return `Added ${filepath}`;
      },
    });
  }
}
