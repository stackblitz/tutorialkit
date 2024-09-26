import { readPublicImage } from './publicImage';

export function readFaviconFile(faviconPrefix: string = 'favicon') {
  const faviconFilename = `${faviconPrefix}.svg`;
  return readPublicImage(faviconFilename);
}
