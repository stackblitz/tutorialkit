/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface WebContainerConfig {
  editorOrigin: string;
  clientId: string;
  scope: string;
}

declare module 'tutorialkit:override-components' {
  const topBar: typeof import('./components/TopBar.astro').default;
  const headTags: typeof import('./components/HeadTags.astro').default;
  const footer: typeof import('./components/Footer.astro').default;
  const dialog: typeof import('@tutorialkit/react/dialog').default;

  export { topBar as TopBar, dialog as Dialog, footer as Footer, headTags as HeadTags };
}

declare const __ENTERPRISE__: boolean;
declare const __WC_CONFIG__: WebContainerConfig | undefined;
