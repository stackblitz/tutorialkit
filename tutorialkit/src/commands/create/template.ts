import * as prompts from '@clack/prompts';
import ignore from 'ignore';
import fsPromises from 'node:fs/promises';
import path from 'node:path';
import { warnLabel } from '../../utils/messages';
import { templatePath, type CreateOptions } from './options';

export async function copyTemplate(dest: string, flags: CreateOptions) {
  if (flags.dryRun) {
    prompts.log.warn(`${warnLabel('DRY RUN')} Skipped copying template`);
    return;
  }

  const gitignore = ignore().add(await fsPromises.readFile(path.resolve(templatePath, '.gitignore'), 'utf8'));

  const toCopy: string[] = [];
  const folders = await fsPromises.readdir(templatePath);

  for (const file of folders) {
    if (gitignore.ignores(file)) {
      continue;
    }

    toCopy.push(file);
  }

  for (const fileName of toCopy) {
    const sourceFilePath = path.join(templatePath, fileName);
    const destFilePath = path.join(dest, fileName);

    const stats = await fsPromises.stat(sourceFilePath);

    if (stats.isDirectory()) {
      await fsPromises.cp(sourceFilePath, destFilePath, { recursive: true });
    } else if (stats.isFile()) {
      await fsPromises.copyFile(sourceFilePath, destFilePath);
    }
  }
}
