import fs from 'node:fs';
import path from 'node:path';
import { joinPaths } from './url';

export function readPublicImage(filename: string) {
  let image;
  const exists = fs.existsSync(path.join('public', filename));

  if (exists) {
    image = joinPaths(import.meta.env.BASE_URL, filename);
  }

  return image;
}
