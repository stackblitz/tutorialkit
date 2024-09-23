---
type: lesson
title: Progress bar
slug: progress-bar
focus: /style.css
template: default
---

## Styling the `<progress>`

`<progress>` is an often overlooked element that allows you to show... well, the completion progress of a task.

Although `accent-color` that we've set in the previous step already impacts this element, we can customize it even further!

Let's start by setting removing the border from the element. As you do it, you will notice that it will also change other aspects of the default appearance, like the height and radius.

```css add={2}
progress {
  border: none;
}
```
