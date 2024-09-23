---
type: lesson
title: Handle Firefox
slug: handle-firefox
focus: /style.css
template: default
---

## What about Firefox?

If you look at our `<progress>` element in Firefox, you will see that it doesn't work that well. Firefox does not support the `progress-bar` and `progress-value` the way WebKit/Chrome browsers do, but setting `border: none` does turn off the defaut styling!

We should make sure only browsers that can support this kind of customization apply it. We can do it with the `@supports` CSS rule. More specifically: `@supports selector(...)` one. Wrap our custom css code with the following:

```css
@supports selector(::-webkit-progress-bar) {
  progress { ...
}
```

In `style.css` you already see these selectors. Try styling them up: set `background` and `border-radius` to values you like!
