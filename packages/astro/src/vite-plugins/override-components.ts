/**
 * A plugin that lets users to override TutorialKit's components.
 *
 * The virtual module can be imported as:
 *
 * ```ts
 * import { TopBar } from 'tutorialkit:override-components';
 *
 * <TopBar />
 * ```
 *
 * User can override the components in `astro.config.ts`:
 *
 * ```ts
 * export default defineConfig({
 *   integrations: [
 *     tutorialkit({
 *       components: {
 *         TopBar: './CustomTopBar.astro',
 *       },
 *     }),
 *   ],
 * });
 * ```
 */
import type { VitePlugin } from '../types.js';

export interface OverrideComponentsOptions {
  /**
   * Component for overriding the top bar.
   *
   * This component has 3 slots that are used to pass TutorialKit's default components:
   * - `logo`: Logo of the application
   * - `theme-switch`:  Switch for changing the theme
   * - `login-button`: For StackBlitz Enterprise user, the login button
   *
   * Usage:
   * ```jsx
   *   <slot name="logo" />
   *   <slot name="theme-switch" />
   *   <slot name="login-button" />
   * ```
   */
  TopBar?: string;
}

const virtualModuleId = 'tutorialkit:override-components';
const resolvedId = `\0${virtualModuleId}`;

export function overrideComponents(options?: OverrideComponentsOptions): VitePlugin {
  const topBar = options?.TopBar || '@tutorialkit/astro/default/components/TopBar.astro';

  return {
    name: 'tutorialkit-override-components-plugin',
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedId;
      }

      return undefined;
    },
    async load(id) {
      if (id === resolvedId) {
        return `
          export { default as TopBar } from '${topBar}';
        `;
      }

      return undefined;
    },
  };
}
