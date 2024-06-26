/**
 * A plugin that let users write components that can interact with the tutorial
 * state, indirectly acting on the editor and WebContainer.
 *
 * The virtual module can be imported as:
 *
 * ```ts
 * import tutorialStore from 'tutorialkit:store';
 *
 * export const MyComponent = () => (
 *   <button onClick={() => tutorialStore.reset()}>Reset</button>
 * );
 * ```
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { VitePlugin } from '../types.js';
import { normalizeImportPath } from '../utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const virtualModuleId = 'tutorialkit:store';
const resolvedVirtualModuleId = `${virtualModuleId}`;

export const tutorialkitStore: VitePlugin = {
  name: 'tutorialkit-store-virtual-mod-plugin',
  resolveId(id) {
    if (id === virtualModuleId) {
      return resolvedVirtualModuleId;
    }

    return undefined;
  },
  async load(id) {
    if (id === resolvedVirtualModuleId) {
      const pathToInit = normalizeImportPath(path.join(__dirname, 'default/components/webcontainer.ts'));

      return `
        import { tutorialStore } from '${pathToInit}';
        export default tutorialStore;
      `;
    }

    return undefined;
  },
};
