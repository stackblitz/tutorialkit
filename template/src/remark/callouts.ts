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
  borderColor: string;
  backgroundColor: string;
  titleColor: string;
}

const callouts: Record<string, Callout> = {
  tip: {
    title: 'Tip',
    icon: 'i-ph-rocket-launch-bold',
    borderColor: 'border-callout-tip-border',
    backgroundColor: 'bg-callout-tip-bg',
    titleColor: 'text-callout-tip-text',
  },
  info: {
    title: 'Info',
    icon: 'i-ph-info-bold',
    borderColor: 'border-callout-info-border',
    backgroundColor: 'bg-callout-info-bg',
    titleColor: 'text-callout-info-text',
  },
  warn: {
    title: 'Warning',
    icon: 'i-ph-warning-circle-bold',
    borderColor: 'border-callout-warn-border',
    backgroundColor: 'bg-callout-warn-bg',
    titleColor: 'text-callout-warn-text',
  },
  danger: {
    title: 'Danger',
    icon: 'i-ph-x-circle',
    borderColor: 'border-callout-danger-border',
    backgroundColor: 'bg-callout-danger-bg',
    titleColor: 'text-callout-danger-text',
  },
};

type CalloutVariant = keyof typeof callouts;

const variants = new Set<CalloutVariant>(['tip', 'info', 'warn', 'danger']);

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

export function remarkCallouts() {
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
            `callout callout-${variant} my-4`,
            'flex flex-col p-3',
            attributes.class ?? '',
            callout.backgroundColor,
            ...(noBorder ? [] : ['border-l-3', callout.borderColor]),
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
                className: ['w-full flex gap-2 items-center', callout.titleColor],
                ariaHidden: true,
              },
            },
            children: [
              ...(hideIcon
                ? []
                : ([
                    {
                      type: 'html',
                      value: `<span class="text-6 inline-block ${callout.icon}"></span>`,
                    },
                  ] satisfies Children)),
              {
                type: 'html',
                value: `<span class="text-4 font-bold inline-block"> ${title}</span>`,
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
      children: children,
    },
  ] satisfies Children;
}
