/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface WebContainerConfig {
  editorOrigin: string;
  clientId: string;
  scope: string;
}

declare const __ENTERPRISE__: boolean;
declare const __WC_CONFIG__: WebContainerConfig | undefined;
