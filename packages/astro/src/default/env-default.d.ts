/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface WebContainerConfig {
  editorOrigin: string;
  clientId: string;
  scope: string;
}

declare module 'tutorialkit:override-components' {
  const topBar: typeof import('./src/default/components/TopBar.astro').default;

  export { topBar as TopBar };
}

declare module 'tutorialkit:astro-swap-functions';

declare const __ENTERPRISE__: boolean;
declare const __WC_CONFIG__: WebContainerConfig | undefined;
