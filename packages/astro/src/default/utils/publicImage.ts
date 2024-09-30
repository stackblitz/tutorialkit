import fs from 'node:fs';
import path from 'node:path';
import { joinPaths } from './url';

export function readPublicImage(filename: string, absolute?: boolean) {
  let image;
  const exists = fs.existsSync(path.join('public', filename));

  if (!exists) {
    return;
  }

  image = joinPaths(import.meta.env.BASE_URL, filename);

  if (absolute) {
    const site = import.meta.env.SITE;

    if (!site) {
      // the SITE env variable inherits the value from Astro.site configuration
      console.warn('Trying to compute an absolute file URL but Astro.site is not set.');
    } else {
      image = joinPaths(site, image);
    }
  }

  return image;
}
