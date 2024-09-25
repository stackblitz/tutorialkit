import fs from 'node:fs';
import path from 'node:path';
import { joinPaths } from './url';

export function readFaviconFile(faviconPrefix: string = 'favicon') {
  let favicon;

  const faviconFilename = `${faviconPrefix}.svg`;
  const exists = fs.existsSync(path.join('public', faviconFilename));

  if (exists) {
    favicon = joinPaths(import.meta.env.BASE_URL, faviconFilename);
  }

  return favicon;
}
