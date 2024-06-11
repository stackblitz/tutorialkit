/**
 * A plugin that let users write components that can interact with the tutorial
 * state, indirectly acting on the editor and WebContainer.
 *
 * The virtual module can be imported as:
 *
 * ```ts
 * import { tutorialStore } from 'tutorialkit:state';
 *
 * export const MyComponent = () => (
 *   <button onClick={() => tutorialStore.reset()}>Reset</button>
 * );
 * ```
 */
import type { VitePlugin } from '../types.js';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const virtualModuleId = 'tutorialkit:state';
const resolvedVirtualModuleId = `${virtualModuleId}`;

export const tutorialkitState: VitePlugin = {
  name: 'tutorialkit-state-virtual-mod-plugin',
  resolveId(id) {
    if (id === virtualModuleId) {
      return resolvedVirtualModuleId;
    }
  },
  async load(id) {
    if (id === resolvedVirtualModuleId) {
      const pathToInit = path.join(__dirname, 'default', 'components', 'webcontainer.ts');

      return `
        export { tutorialStore, webcontainer } from '${pathToInit}';
      `;
    }
  },
};
