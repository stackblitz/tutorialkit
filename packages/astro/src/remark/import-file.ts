import * as kleur from 'kleur/colors';
import type { Root } from 'mdast';
import fs from 'node:fs';
import path from 'node:path';
import type { Transformer } from 'unified';
import { visit } from 'unist-util-visit';

interface RemarkImportFilePluginOptions {
  templatesPath: string;
}

export function remarkImportFilePlugin(options: RemarkImportFilePluginOptions) {
  return (): Transformer<Root> => {
    return (tree, file) => {
      const cwd = path.dirname(file.path);
      const { frontmatter } = file.data.astro as Record<string, any>;
      const templateName = frontmatter.template ?? 'default';
      const templatesPath = path.join(options.templatesPath, templateName);

      visit(tree, (node) => {
        if (node.type !== 'code') {
          return undefined;
        }

        if (node.lang && /^(file|solution):/.test(node.lang)) {
          // we allow both a leading slash and without for file names to make it more graceful
          const relativeFilePath = node.lang.replace(/^(file|solution):\//, '');

          let content: string | undefined;

          if (node.lang.startsWith('file:')) {
            // we first try to read the file from the lesson files
            content = tryRead(path.join(cwd, '_files', relativeFilePath), false);

            // if the file isn't part of the lesson files we try to read it from the lesson's template
            if (!content) {
              content = tryRead(path.join(templatesPath, relativeFilePath));
            }
          } else if (node.lang.startsWith('solution:')) {
            content = tryRead(path.join(cwd, '_solution', relativeFilePath));
          }

          if (content) {
            node.value = content;
            node.lang = path.extname(relativeFilePath).slice(1);
          }
        }

        return undefined;
      });
    };
  };
}

function tryRead(filePath: string, warn = true) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    if (warn) {
      printWarning(`Could not read '${filePath}'. Are you sure this file exists?`);
    }
  }
}

function printWarning(message: string) {
  const time = new Date().toTimeString().slice(0, 8);

  console.warn(kleur.yellow(`${kleur.bold(time)} [WARN] [remarkImportFilePlugin] ${message}`));
}
