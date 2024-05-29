import fs from 'node:fs/promises';
import { t, parse, visit } from './babel.js';
import type { Options } from '../../../../astro/src/index.js';

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

export function replaceArgs(newTutorialKitArgs: Options, ast: t.File) {
  const integrationImport = '@tutorialkit/astro';

  let integrationId: t.Identifier | undefined;

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

  visit(ast, {
    ExportDefaultDeclaration(path) {
      if (!t.isCallExpression(path.node.declaration)) {
        return;
      }

      const configObject = path.node.declaration.arguments[0];

      if (!t.isObjectExpression(configObject)) {
        throw new Error('TutorialKit is not part of the exported config');
      }

      let integrationsProp = configObject.properties.find((prop) => {
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

      if (!integrationCall) {
        integrationCall = t.callExpression(integrationId, []);
        integrationsProp.value.elements.push(integrationCall);
      }

      const integrationArgs = integrationCall.arguments;

      if (integrationArgs.length === 0) {
        const objectArgs = fromPOJO(newTutorialKitArgs) as t.ObjectExpression;

        if (objectArgs.properties.length > 0) {
          integrationArgs.push(objectArgs);
        }

        return;
      }

      if (!t.isObjectExpression(integrationArgs[0])) {
        throw new Error('Only updating an existing object literal as the config is supported');
      }

      updateObject(newTutorialKitArgs, integrationArgs[0]);
    },
  });
}

function updateObject(properties: any, object: t.ObjectExpression | undefined): t.ObjectExpression {
  if (typeof properties !== 'object') {
    return t.objectExpression([]);
  }

  object ??= t.objectExpression([]);

  for (const property of properties) {
    const propertyInObject = object.properties.find((prop) => {
      return prop.type === 'ObjectProperty' && prop.key === property;
    }) as t.ObjectProperty | undefined;

    if (!propertyInObject) {
      object.properties.push(t.objectProperty(t.identifier(property), fromPOJO(properties[property])));
    } else {
      if (typeof properties[property] === 'object' && t.isObjectExpression(propertyInObject.value)) {
        updateObject(properties[property], propertyInObject.value);
      } else {
        propertyInObject.value = fromPOJO(properties[property]);
      }
    }
  }
}

function fromPOJO(value: any): t.Expression {
  if (value == null) {
    return t.nullLiteral();
  }

  if (typeof value === 'string') {
    return t.stringLiteral(value);
  }

  if (typeof value === 'number') {
    return t.numericLiteral(value);
  }

  if (Array.isArray(value)) {
    return t.arrayExpression(value.map(fromPOJO));
  }

  return t.objectExpression(Object.keys(value).map((key) => t.objectProperty(t.identifier(key), fromPOJO(value[key]))));
}
