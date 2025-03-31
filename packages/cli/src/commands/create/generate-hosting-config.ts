import fs from 'node:fs';
import path from 'node:path';
import * as prompts from '@clack/prompts';
import chalk from 'chalk';
import { warnLabel } from 'src/utils/messages.js';
import { runTask } from 'src/utils/tasks.js';
import cloudflareConfigRaw from './hosting-config/_headers.txt?raw';
import netlifyConfigRaw from './hosting-config/netlify_toml.txt?raw';
import vercelConfigRaw from './hosting-config/vercel.json?raw';
import { DEFAULT_VALUES, readFlag, type CreateOptions } from './options.js';

export async function generateHostingConfig(dest: string, flags: CreateOptions) {
  let provider: string | false | symbol = readFlag(flags, 'provider');

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

  if (typeof provider !== 'string') {
    provider = 'skip';
  }

  if (!provider || provider === 'skip') {
    prompts.log.message(
      `${chalk.blue('hosting provider config [skip]')} You can configure hosting provider settings manually later.`,
    );

    return provider;
  }

  prompts.log.info(`${chalk.blue('Hosting Configuration')} Setting up configuration for ${provider}`);

  const resolvedDest = path.resolve(dest);

  if (!fs.existsSync(resolvedDest)) {
    fs.mkdirSync(resolvedDest, { recursive: true });
  }

  let config: string | undefined;
  let filename: string | undefined;

  switch (provider.toLowerCase()) {
    case 'vercel': {
      config = typeof vercelConfigRaw === 'string' ? vercelConfigRaw : JSON.stringify(vercelConfigRaw, null, 2);
      filename = 'vercel.json';
      break;
    }
    case 'netlify': {
      config = netlifyConfigRaw;
      filename = 'netlify.toml';
      break;
    }
    case 'cloudflare': {
      config = cloudflareConfigRaw;
      filename = '_headers';
      break;
    }
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

  return provider;
}
