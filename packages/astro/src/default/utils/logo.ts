import fs from 'node:fs';
import path from 'node:path';
import { LOGO_EXTENSIONS } from './constants';
import { joinPaths } from './url';

export function readLogoFile(logoPrefix: string = 'logo') {
  let logo;

  for (const logoExt of LOGO_EXTENSIONS) {
    const logoFilename = `${logoPrefix}.${logoExt}`;
    const exists = fs.existsSync(path.join('public', logoFilename));

    if (exists) {
      logo = joinPaths(import.meta.env.BASE_URL, logoFilename);
      break;
    }
  }

  return logo;
}
