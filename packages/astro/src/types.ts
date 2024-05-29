import type { AstroIntegration } from 'astro';

export type AstroConfigSetupOptions = Parameters<NonNullable<AstroIntegration['hooks']['astro:config:setup']>>[0];
export type AstroServerSetupOptions = Parameters<Required<AstroIntegration['hooks']>['astro:server:setup']>['0'];
export type AstroBuildDoneOptions = Parameters<Required<AstroIntegration['hooks']>['astro:build:done']>['0'];
export type ViteDevServer = AstroServerSetupOptions['server'];
export type VitePlugin = ViteDevServer['config']['plugins'][0];
export type Files = Record<string, string | { base64: string }>;
