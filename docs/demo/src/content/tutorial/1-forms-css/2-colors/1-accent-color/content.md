---
type: lesson
title: Accent Color
focus: /style.css
slug: accent-color
---

## Customize the input colors

<img src="/images/accent-color.png" class="h-20 m-auto">

In the Preview window, we've displayed several native elements: different `input` types and a `progress` bar. Depending on your operating system settings, these will have a different default colors.

Such colors might not fit your brand, or the current theme of your application.

Thankfully, you can change them, and the good news is: you only need one CSS property to do that!

Try setting `accent-color` for the whole document by adding the following code inside the `body` selector:

```css add={2}
body {
  accent-color: #ff3399;
}
```
