import * as prompts from '@clack/prompts';
import fs from 'node:fs';
import path from 'node:path';
import { assertNotCanceled } from '../../utils/tasks.js';
import type { CreateOptions } from './options.js';
import { parseAstroConfig, replaceArgs } from './astro-config.js';
import { generate } from './babel.js';

export async function setupEnterpriseConfig(dest: string, flags: CreateOptions) {
  let editorOrigin = flags.enterprise;

  if (!flags.defaults && flags.enterprise === undefined) {
    const answer = await prompts.confirm({
      message: `TutorialKit uses StackBlitz WebContainers, do you want to configure the Enterprise version?`,
      initialValue: false,
    });

    assertNotCanceled(answer);

    if (!answer) {
      return;
    }

    const editorURL = await prompts.text({
      message: `What's the origin of your StackBlitz instance?`,
      placeholder: 'https://editor.stackblitz.acme.com',
      validate: validateEditorOrigin,
    });

    assertNotCanceled(editorURL);

    editorOrigin = new URL(editorURL).origin;
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
