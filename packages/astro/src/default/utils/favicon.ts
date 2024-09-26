import { readPublicImage } from './publicImage';

export function readFaviconFile(faviconPrefix: string = 'favicon', site?: string) {
  const faviconFilename = `${faviconPrefix}.svg`;
  return readPublicImage(faviconFilename, site);
}
