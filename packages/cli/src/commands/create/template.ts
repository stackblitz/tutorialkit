import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import path from 'node:path';
import * as prompts from '@clack/prompts';
import ignore from 'ignore';
import { warnLabel } from '../../utils/messages.js';
import { templatePath, type CreateOptions } from './options.js';

export async function copyTemplate(dest: string, flags: CreateOptions) {
  if (flags.dryRun) {
    prompts.log.warn(`${warnLabel('DRY RUN')} Skipped copying template`);
    return;
  }

  const gitignore = ignore.default().add(readIgnoreFile());

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
    const destFileName = fileName === '.npmignore' ? '.gitignore' : fileName;
    const destFilePath = path.join(dest, destFileName);

    const stats = await fsPromises.stat(sourceFilePath);

    if (stats.isDirectory()) {
      await fsPromises.cp(sourceFilePath, destFilePath, { recursive: true });
    } else if (stats.isFile()) {
      await fsPromises.copyFile(sourceFilePath, destFilePath);
    }
  }
}

function readIgnoreFile() {
  try {
    // we try to read the `.npmignore` first because npm unpacks `.gitignore` as `.npmignore`
    return fs.readFileSync(path.resolve(templatePath, '.npmignore'), 'utf8');
  } catch {
    return fs.readFileSync(path.resolve(templatePath, '.gitignore'), 'utf8');
  }
}
