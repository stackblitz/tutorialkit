/**
 * A plugin that lets users override TutorialKit's components.
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
   *   - `logo`: Logo of the application
   *   - `theme-switch`:  Switch for changing the theme
   *   - `login-button`: For StackBlitz Enterprise user, the login button
   *
   * Usage:
   *
   * ```jsx
   *   <slot name="logo" />
   *   <slot name="theme-switch" />
   *   <slot name="login-button" />
   * ```
   */
  TopBar?: string;
}

interface Options {
  components?: OverrideComponentsOptions;
  defaultRoutes: boolean;
}

const virtualModuleId = 'tutorialkit:override-components';
const resolvedId = `\0${virtualModuleId}`;

export function overrideComponents({ components, defaultRoutes }: Options): VitePlugin {
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
        const topBar = components?.TopBar || resolveDefaultTopBar(defaultRoutes);

        return `
          export { default as TopBar } from '${topBar}';
        `;
      }

      return undefined;
    },
  };
}

function resolveDefaultTopBar(defaultRoutes: boolean) {
  if (defaultRoutes) {
    return '@tutorialkit/astro/default/components/TopBar.astro';
  }

  // default `TopBar` is used from local file when `defaultRoutes` is disabled
  return './src/components/TopBar.astro';
}
