import fs from 'node:fs';
import path from 'node:path';
import type { CreateOptions } from './options.js';
import { parseAstroConfig, replaceArgs } from './astro-config.js';
import { generate } from './babel.js';

export async function setupEnterpriseConfig(dest: string, flags: CreateOptions) {
  let editorOrigin = flags.enterprise;

  if (!flags.defaults && flags.enterprise === undefined) {
    return;
  } else if (editorOrigin) {
    const error = validateEditorOrigin(editorOrigin);

    if (error) {
      throw error;
    }

    editorOrigin = new URL(editorOrigin).origin;
  }

  const configPath = path.resolve(dest, 'astro.config.ts');

  if (!flags.dryRun && editorOrigin) {
    const astroConfig = await parseAstroConfig(configPath);

    replaceArgs(
      {
        enterprise: {
          clientId: 'wc_api',
          editorOrigin,
          scope: 'turbo',
        },
      },
      astroConfig,
    );

    const defaultExport = 'export default defineConfig';
    let output = generate(astroConfig);

    // add a new line
    output = output.replace(defaultExport, `\n${defaultExport}`);

    fs.writeFileSync(configPath, output);
  }
}

function validateEditorOrigin(value: string): string | undefined {
  if (!value) {
    return 'Please provide an origin!';
  }

  try {
    const url = new URL(value);

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return 'Please provide an origin starting with http:// or https://';
    }
  } catch (error) {
    return 'Please provide a valid origin URL!';
  }
}
