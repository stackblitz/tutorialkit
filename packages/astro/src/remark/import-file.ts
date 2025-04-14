import fs from 'node:fs';
import path from 'node:path';
import type { BaseSchema, ChapterSchema, LessonSchema, PartSchema, TutorialSchema } from '@tutorialkit/types';
import frontMatter from 'front-matter';
import * as kleur from 'kleur/colors';
import type { Root } from 'mdast';
import type { Transformer } from 'unified';
import { visit } from 'unist-util-visit';

interface RemarkImportFilePluginOptions {
  templatesPath: string;
}

export function remarkImportFilePlugin(options: RemarkImportFilePluginOptions) {
  return (): Transformer<Root> => {
    return (tree, file) => {
      // we only want to process content files (both md and mdx) and ignore any other markdown files
      if (!file.basename || !/^content\.mdx?$/.test(file.basename)) {
        return;
      }

      const cwd = path.dirname(file.path);
      const templateName = getTemplateName(file.path);
      const templatesPath = path.join(options.templatesPath, templateName);

      visit(tree, (node) => {
        if (node.type !== 'code') {
          return undefined;
        }

        if (node.lang && /^(files?|solution):/.test(node.lang)) {
          // we allow both a leading slash and without for file names to make it more graceful
          const relativeFilePath = node.lang.replace(/^(files?|solution):\//, '');

          let content: string | undefined;

          if (/^files?\:/.test(node.lang)) {
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
            node.meta ||= '';
            node.meta += ' path=' + node.lang;
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

  return undefined;
}

function getTemplateName(file: string) {
  const content = fs.readFileSync(file, 'utf8');

  const meta = frontMatter<BaseSchema & Pick<TutorialSchema | PartSchema | ChapterSchema | LessonSchema, 'type'>>(
    content,
  );

  if (meta.attributes.template) {
    return meta.attributes.template;
  }

  /**
   * If we reach this point, it means we haven't encountered a template name yet
   * and we cannot go any further up the tutorial hierarchy. In this case, we return
   * a default value.
   */
  if (meta.attributes.type === 'tutorial') {
    return 'default';
  }

  // otherwise we traverse up the tutorial hierarchy
  return getTemplateName(path.join(path.dirname(path.dirname(file)), 'meta.md'));
}

function printWarning(message: string) {
  const time = new Date().toTimeString().slice(0, 8);

  console.warn(kleur.yellow(`${kleur.bold(time)} [WARN] [remarkImportFilePlugin] ${message}`));
}
