import { createConnection, createServer, createSimpleProject } from '@volar/language-server/node';
import { create as createYamlService } from 'volar-service-yaml';
import { SchemaPriority } from 'yaml-language-server';
import { frontmatterPlugin } from './languagePlugin';
import { readSchema } from './schema';

const connection = createConnection();
const server = createServer(connection);

connection.listen();

connection.onInitialize((params) => {
  const yamlService = createYamlService({
    getLanguageSettings(_context) {
      const schema = readSchema();

      return {
        completion: true,
        validate: true,
        hover: true,
        format: true,
        yamlVersion: '1.2',
        isKubernetes: false,
        schemas: [
          {
            uri: 'https://tutorialkit.dev/reference/configuration',
            schema,
            fileMatch: ['volar-embedded-content://tutorialkit_frontmatter/**/*'],
            priority: SchemaPriority.Settings,
          },
        ],
      };
    },
  });

  delete yamlService.capabilities.codeLensProvider;

  return server.initialize(
    params,
    createSimpleProject([frontmatterPlugin(connection.console.debug.bind(connection.console.debug))]),
    [yamlService],
  );
});

connection.onInitialized(server.initialized);

connection.onShutdown(server.shutdown);
