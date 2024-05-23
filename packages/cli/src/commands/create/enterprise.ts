import * as prompts from '@clack/prompts';
import fs from 'node:fs';
import path from 'node:path';
import { assertNotCanceled } from '../../utils/tasks';
import type { CreateOptions } from './options';
import type { TutorialKitConfig } from './types';

export async function setupEnterpriseConfig(dest: string, flags: CreateOptions) {
  const configPath = path.resolve(dest, 'tutorialkit.config.json');

  let editorOrigin = flags.enterprise;

  if (!flags.defaults && flags.enterprise === undefined) {
    const answer = await prompts.confirm({
      message: `TutorialKit uses StackBlitz WebContainers, do you want to configure the Enterprise version?`,
      initialValue: false,
    });

    assertNotCanceled(answer);

    if (!answer) {
      if (!flags.dryRun) {
        fs.rmSync(configPath);
      }
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

  if (!flags.dryRun && editorOrigin) {
    const configJson: TutorialKitConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    configJson.enterprise = {
      clientId: 'wc_api',
      editorOrigin,
      scope: 'turbo',
    };

    fs.writeFileSync(configPath, JSON.stringify(configJson, undefined, 2));
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
