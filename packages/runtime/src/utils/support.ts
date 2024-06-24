export function isWebContainerSupported() {
  try {
    const hasSharedArrayBuffer = 'SharedArrayBuffer' in globalThis;
    const looksLikeChrome = navigator.userAgent.includes('Chrome');
    const looksLikeFirefox = navigator.userAgent.includes('Firefox');
    const looksLikeSafari = navigator.userAgent.includes('Safari');

    if (hasSharedArrayBuffer && (looksLikeChrome || looksLikeFirefox)) {
      return true;
    }

    if (hasSharedArrayBuffer && looksLikeSafari) {
      // we only support Safari 16.4 and up so we check for the version here
      const match = navigator.userAgent.match(/Version\/(\d+)\.(\d+) (?:Mobile\/.*?)?Safari/);
      const majorVersion = match ? Number(match?.[1]) : 0;
      const minorVersion = match ? Number(match?.[2]) : 0;

      return majorVersion > 16 || (majorVersion === 16 && minorVersion >= 4);
    }

    // allow overriding the support check with localStorage.webcontainer_any_ua = 1
    return Boolean(localStorage.getItem('webcontainer_any_ua'));
  } catch {
    return false;
  }
}
