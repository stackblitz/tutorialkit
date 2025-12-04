/**
 * Based on https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types
 * Removing svg, which is not binary.
 */
const binaryImageExtensions = new Set(['apng', 'png', 'avif', 'gif', 'jpg', 'jpeg', 'jfif', 'pjpeg', 'pjp', 'webp']);

export function uint8ArrayToDataUrl(arr: Uint8Array) {
  return URL.createObjectURL(new Blob([arr.buffer]));
}
export function isBinaryImagePath(filePath: string) {
  const split = filePath.split('.');

  if (split.length < 2) {
    return false;
  }

  const ext = split[split.length - 1];

  return binaryImageExtensions.has(ext);
}

export function ImageContent({ src }: { src: string }) {
  return <img src={src} />;
}
