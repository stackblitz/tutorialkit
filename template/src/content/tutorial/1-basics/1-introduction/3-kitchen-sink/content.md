---
type: lesson
title: Foo from part 1
fileTree: false
---

:::tip{noBorder=true title="Foo"}
Some info
:::

:::tip{noBorder=true title="Foo" hideIcon=true}
Some info
:::

:::tip{hideTitle=true noBorder=true title="Foo"}
Some info
:::

:::tip{hideTitle=true}
Some info
:::

:::tip{noBorder=true}
Some info
:::

:::info
Some info
:::

:::warn
Some **content** with _Markdown_ `syntax`.
:::

en dash (--)

# GFM

## Autolink literals

www.example.com, https://example.com, and contact@example.com.

## Footnote

A note[^1]

[^1]: Big note.

## Strikethrough

~one~ or ~~two~~ tildes.

## Table

| a   | b   |   c |  d  |
| --- | :-- | --: | :-: |

## Tasklist

- [ ] to do
- [x] done

```js title="foo" del=/require/ collapse={2-3} add=module del=plugins "="
module.exports = {
  plugins: [require('autoprefixer'), require('cssnano')],
  plugins: [require('autoprefixer'), require('cssnano')],
  plugins: [require('autoprefixer'), require('cssnano')],
};
```
