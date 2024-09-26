import fs from 'node:fs';
import path from 'node:path';
import { joinPaths } from './url';

export function readPublicImage(filename: string, site?: string) {
  let image;
  const exists = fs.existsSync(path.join('public', filename));

  if (!exists) {
    return;
  }

  image = joinPaths(import.meta.env.BASE_URL, filename);

  if (site) {
    image = joinPaths(site, image);
  }

  return image;
}
