import fs from 'node:fs/promises';
import type { Options } from '../../../astro/src/index.js';
import { parse, t, visit, generate } from './babel.js';

export async function parseAstroConfig(astroConfigPath: string): Promise<t.File> {
  const source = await fs.readFile(astroConfigPath, { encoding: 'utf-8' });
  const result = parse(source);

  if (!result) {
    throw new Error('Unknown error parsing astro config');
  }

  if (result.errors.length > 0) {
    throw new Error('Error parsing astro config: ' + JSON.stringify(result.errors));
  }

  return result;
}

export function generateAstroConfig(astroConfig: t.File): string {
  const defaultExport = 'export default defineConfig';

  let output = generate(astroConfig);

  // add a new line
  output = output.replace(defaultExport, `\n${defaultExport}`);

  return output;
}

/**
 * This function modifies the arguments provided to the tutorialkit integration in the astro
 * configuration.
 *
 * For example:
 *
 * ```ts
 * tutorialkit({ isolation: 'require-corp' })
 * ```
 *
 * If `tutorialkit` is currently invoked like in the example above, and this function is called
 * with `{ enterprise: {} }` as the new tutorialkit object, then the modified config will contain:
 *
 * ```ts
 * tutorialkit({ isolation: 'require-corp', enterprise: {} })
 * ```
 *
 * @param newTutorialKitArgs Arguments to be provided to the tutorialkit integration.
 * @param ast The astro config parsed by babel.
 */
export function replaceArgs(newTutorialKitArgs: Options, ast: t.File) {
  const integrationImport = '@tutorialkit/astro';

  let integrationId: t.Identifier | undefined;

  /**
   * In the first pass we search for the tutorialkit name by looking for a default import
   * to `@tutorialkit/astro`.
   */
  visit(ast, {
    ImportDeclaration(path) {
      if (path.node.source.value === integrationImport) {
        const defaultImport = path.node.specifiers.find((specifier) => specifier.type === 'ImportDefaultSpecifier') as
          | t.ImportDefaultSpecifier
          | undefined;

        if (defaultImport) {
          integrationId = defaultImport.local;
        }
      }
    },
  });

  if (!integrationId) {
    throw new Error(`Could not find import to '${integrationImport}'`);
  }

  /**
   * In the second pass, we search for a default export which is a call to `defineConfig`
   * and we look for our `integrationId` that we just got from the `integrations` field.
   */
  visit(ast, {
    ExportDefaultDeclaration(path) {
      if (!t.isCallExpression(path.node.declaration)) {
        return;
      }

      const configObject = path.node.declaration.arguments[0];

      if (!t.isObjectExpression(configObject)) {
        throw new Error('TutorialKit is not part of the exported config');
      }

      const integrationsProp = configObject.properties.find((prop) => {
        if (prop.type !== 'ObjectProperty') {
          return false;
        }

        if (prop.key.type === 'Identifier') {
          if (prop.key.name === 'integrations') {
            return true;
          }
        }

        if (prop.key.type === 'StringLiteral') {
          if (prop.key.value === 'integrations') {
            return true;
          }
        }

        return false;
      }) as t.ObjectProperty | undefined;

      if (integrationsProp.value.type !== 'ArrayExpression') {
        throw new Error('Unable to parse integrations in Astro config');
      }

      let integrationCall = integrationsProp.value.elements.find((expr) => {
        return t.isCallExpression(expr) && t.isIdentifier(expr.callee) && expr.callee.name === integrationId.name;
      }) as t.CallExpression | undefined;

      // if the integration wasn't found we add it
      if (!integrationCall) {
        integrationCall = t.callExpression(integrationId, []);
        integrationsProp.value.elements.push(integrationCall);
      }

      const integrationArgs = integrationCall.arguments;

      // if `tutorialkit` is called as `tutorialkit()`
      if (integrationArgs.length === 0) {
        const objectArgs = fromValue(newTutorialKitArgs) as t.ObjectExpression;

        if (objectArgs.properties.length > 0) {
          integrationArgs.push(objectArgs);
        }

        return;
      }

      if (!t.isObjectExpression(integrationArgs[0])) {
        throw new Error('Only updating an existing object literal as the config is supported');
      }

      // if `tutorialkit` is called with an object literal we update its existing properties
      updateObject(newTutorialKitArgs, integrationArgs[0]);
    },
  });
}

/**
 * Update an object expression to match `properties`, such that:
 *
 *  - If a property is present in `properties` but not in `object` it's added
 *  - If a property is not present in `properties` but in `object` we do nothing
 *  - If a property is present in `properties` and in `object` we:
 *      - Recursively update both if both are object
 *      - Set the value present in properties otherwise
 *
 * @param properties The properties to read keys and values from.
 * @param object The object expression to update.
 */
function updateObject(properties: any, object: t.ObjectExpression | undefined): t.ObjectExpression {
  if (typeof properties !== 'object') {
    return;
  }

  object ??= t.objectExpression([]);

  for (const property in properties) {
    const propertyInObject = object.properties.find((prop) => {
      return prop.type === 'ObjectProperty' && prop.key.type === 'Identifier' && prop.key.name === property;
    }) as t.ObjectProperty | undefined;

    if (!propertyInObject) {
      object.properties.push(t.objectProperty(t.identifier(property), fromValue(properties[property])));
    } else {
      if (typeof properties[property] === 'object' && t.isObjectExpression(propertyInObject.value)) {
        updateObject(properties[property], propertyInObject.value);
      } else {
        propertyInObject.value = fromValue(properties[property]);
      }
    }
  }
}

/**
 * Convert a plain old JavaScript object and primitive value into a babel expression.
 *
 * @param value value to convert
 */
function fromValue(value: any): t.Expression {
  if (value == null) {
    return t.nullLiteral();
  }

  if (typeof value === 'string') {
    return t.stringLiteral(value);
  }

  if (typeof value === 'number') {
    return t.numericLiteral(value);
  }

  if (typeof value === 'boolean') {
    return t.booleanLiteral(value);
  }

  if (Array.isArray(value)) {
    return t.arrayExpression(value.map(fromValue));
  }

  return t.objectExpression(
    Object.keys(value).map((key) => t.objectProperty(t.identifier(key), fromValue(value[key]))),
  );
}
