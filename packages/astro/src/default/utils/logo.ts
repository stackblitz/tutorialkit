import { LOGO_EXTENSIONS } from './constants';
import { readPublicImage } from './publicImage';

export function readLogoFile(logoPrefix: string = 'logo', site?: string) {
  let logo;

  for (const logoExt of LOGO_EXTENSIONS) {
    const logoFilename = `${logoPrefix}.${logoExt}`;
    logo = readPublicImage(logoFilename, site);

    if (logo) {
      break;
    }
  }

  return logo;
}
