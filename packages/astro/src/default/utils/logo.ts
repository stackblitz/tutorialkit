import { LOGO_EXTENSIONS } from './constants';
import { readPublicImage } from './publicImage';

export function readLogoFile(logoPrefix: string = 'logo') {
  let logo;

  for (const logoExt of LOGO_EXTENSIONS) {
    const logoFilename = `${logoPrefix}.${logoExt}`;
    logo = readPublicImage(logoFilename);

    if (logo) {
      break;
    }
  }

  return logo;
}
