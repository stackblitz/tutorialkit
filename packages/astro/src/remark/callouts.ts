// @unocss-include

import { h } from 'hastscript';
import type { BlockContent, DefinitionContent, Node, Parent, Root } from 'mdast';
import {
  directiveToMarkdown,
  type ContainerDirective,
  type Directives,
  type LeafDirective,
  type TextDirective,
} from 'mdast-util-directive';
import { toMarkdown } from 'mdast-util-to-markdown';
import type { Transformer } from 'unified';
import { visit } from 'unist-util-visit';

type Children = Array<BlockContent | DefinitionContent>;

interface Callout {
  title: string;
  icon: string;
}

const callouts: Record<string, Callout> = {
  tip: {
    title: 'Tip',
    icon: 'i-ph-rocket-launch',
  },
  info: {
    title: 'Info',
    icon: 'i-ph-info',
  },
  warn: {
    title: 'Warning',
    icon: 'i-ph-warning-circle',
  },
  success: {
    title: 'Success',
    icon: 'i-ph-check-circle',
  },
  danger: {
    title: 'Danger',
    icon: 'i-ph-x-circle',
  },
};

type CalloutVariant = keyof typeof callouts;

const variants = new Set<CalloutVariant>(['tip', 'info', 'warn', 'danger', 'success']);

function isNodeDirective(node: Node): node is Directives {
  return node.type === 'textDirective' || node.type === 'leafDirective' || node.type === 'containerDirective';
}

function isContainerDirective(node: Node): node is ContainerDirective {
  return node.type === 'containerDirective';
}

/**
 * Transforms back directives not handled by us to avoid breaking user content.
 * For example, we don't handle text directives such as `foo:bar` and we want
 * to keep them unmodified.
 */
function transformUnhandledDirective(node: TextDirective | LeafDirective, index: number, parent: Parent) {
  const textNode = {
    type: 'text',
    value: toMarkdown(node, { extensions: [directiveToMarkdown()] }),
  } as const;

  if (node.type === 'textDirective') {
    parent.children[index] = textNode;
  } else {
    parent.children[index] = {
      type: 'paragraph',
      children: [textNode],
    };
  }
}

export function remarkCalloutsPlugin() {
  return (): Transformer<Root> => {
    return (tree) => {
      visit(tree, (node, index, parent) => {
        if (!parent || index === undefined || !isNodeDirective(node)) {
          return;
        }

        if (node.type === 'textDirective' || node.type === 'leafDirective') {
          transformUnhandledDirective(node, index, parent);
          return;
        }

        if (isContainerDirective(node)) {
          if (!variants.has(node.name as CalloutVariant)) {
            return;
          }

          const variant = node.name as CalloutVariant;
          const callout = callouts[variant];
          const data = node.data || (node.data = {});

          const attributes = node.attributes ?? {};

          const title = attributes.title ?? callout.title;
          const noBorder = attributes.noBorder === 'true';
          const hideTitle = attributes.hideTitle === 'true';
          const hideIcon = attributes.hideIcon === 'true';

          const classes = [
            `callout callout-${variant} my-4 flex flex-col p-3 bg-tk-elements-markdown-callouts-backgroundColor text-tk-elements-markdown-callouts-textColor`,
            attributes.class ?? '',
            ...(noBorder ? [] : ['border-l-3', 'border-tk-elements-markdown-callouts-borderColor']),
          ];

          node.attributes = {
            ...attributes,
            class: classes.filter((calloutClass) => !!calloutClass).join(' '),
            'aria-label': title,
          };

          node.children = generate(title, node.children, callout, hideIcon, hideTitle);

          const tagName = 'aside';
          const hast = h(tagName, node.attributes);
          data.hName = hast.tagName;
          data.hProperties = hast.properties;
        }
      });
    };
  };
}

function generate(title: string, children: any[], callout: Callout, hideIcon: boolean, hideTitle: boolean) {
  return [
    ...(hideTitle
      ? []
      : ([
          {
            type: 'paragraph',
            data: {
              hName: 'div',
              hProperties: {
                className: 'w-full flex gap-2 items-center text-tk-elements-markdown-callouts-titleTextColor',
                ariaHidden: true,
              },
            },
            children: [
              ...(hideIcon
                ? []
                : ([
                    {
                      type: 'html',
                      value: `<span class="text-6 inline-block text-tk-elements-markdown-callouts-iconColor ${callout.icon}"></span>`,
                    },
                  ] satisfies Children)),
              {
                type: 'html',
                value: `<span class="text-4 font-semibold inline-block"> ${title}</span>`,
              },
            ],
          },
        ] satisfies Children)),
    {
      type: 'paragraph',
      data: {
        hName: 'section',
        hProperties: { className: ['callout-content mt-1'] },
      },
      children,
    },
  ] satisfies Children;
}
