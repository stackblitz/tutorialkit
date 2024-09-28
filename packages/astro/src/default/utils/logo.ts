import { LOGO_EXTENSIONS } from './constants';
import { readPublicImage } from './publicImage';

export function readLogoFile(logoPrefix: string = 'logo', absolute?: boolean) {
  let logo;

  for (const logoExt of LOGO_EXTENSIONS) {
    const logoFilename = `${logoPrefix}.${logoExt}`;
    logo = readPublicImage(logoFilename, absolute);

    if (logo) {
      break;
    }
  }

  return logo;
}
