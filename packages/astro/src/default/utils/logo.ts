import { LOGO_EXTENSIONS } from './constants';
import { readPublicAsset } from './publicAsset';

export function readLogoFile(logoPrefix: string = 'logo', absolute?: boolean) {
  let logo;

  for (const logoExt of LOGO_EXTENSIONS) {
    const logoFilename = `${logoPrefix}.${logoExt}`;
    logo = readPublicAsset(logoFilename, absolute);

    if (logo) {
      break;
    }
  }

  return logo;
}
