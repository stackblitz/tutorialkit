import { CodeMapping, type LanguagePlugin, type VirtualCode } from '@volar/language-core';
import type * as ts from 'typescript';
import type { URI } from 'vscode-uri';

export function frontmatterPlugin(debug: (message: string) => void): LanguagePlugin<URI> {
  return {
    getLanguageId(uri) {
      debug('URI: ' + uri.path);

      if (uri.path.endsWith('.md')) {
        return 'markdown';
      }

      if (uri.path.endsWith('.mdx')) {
        return 'mdx';
      }

      return undefined;
    },
    createVirtualCode(_uri, languageId, snapshot) {
      if (languageId === 'markdown' || languageId === 'mdx') {
        return new FrontMatterVirtualCode(snapshot);
      }

      return undefined;
    },
  };
}

export class FrontMatterVirtualCode implements VirtualCode {
  id = 'root';
  languageId = 'markdown';
  mappings: CodeMapping[];
  embeddedCodes: VirtualCode[] = [];

  constructor(public snapshot: ts.IScriptSnapshot) {
    this.mappings = [
      {
        sourceOffsets: [0],
        generatedOffsets: [0],
        lengths: [snapshot.getLength()],
        data: {
          completion: true,
          format: true,
          navigation: true,
          semantic: true,
          structure: true,
          verification: true,
        },
      },
    ];

    this.embeddedCodes = [...frontMatterCode(snapshot)];
  }
}

function* frontMatterCode(snapshot: ts.IScriptSnapshot): Generator<VirtualCode> {
  const content = snapshot.getText(0, snapshot.getLength());

  let frontMatterStartIndex = content.indexOf('---');

  if (frontMatterStartIndex === -1) {
    return;
  }

  frontMatterStartIndex += 3;

  let frontMatterEndIndex = content.indexOf('---', frontMatterStartIndex);

  if (frontMatterEndIndex === -1) {
    frontMatterEndIndex = snapshot.getLength();
  }

  const frontMatterText = content.substring(frontMatterStartIndex, frontMatterEndIndex);

  yield {
    id: 'frontmatter_1',
    languageId: 'yaml',
    snapshot: {
      getText: (start, end) => frontMatterText.slice(start, end),
      getLength: () => frontMatterText.length,
      getChangeRange: () => undefined,
    },
    mappings: [
      {
        sourceOffsets: [frontMatterStartIndex],
        generatedOffsets: [0],
        lengths: [frontMatterText.length],
        data: {
          completion: true,
          format: true,
          navigation: true,
          semantic: true,
          structure: true,
          verification: true,
        },
      },
    ],
    embeddedCodes: [],
  };
}
