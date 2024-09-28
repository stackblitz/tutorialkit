import { readPublicImage } from './publicImage';

export function readFaviconFile(faviconPrefix: string = 'favicon', absolute?: boolean) {
  const faviconFilename = `${faviconPrefix}.svg`;
  return readPublicImage(faviconFilename, absolute);
}
