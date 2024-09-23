---
type: lesson
title: More Progress bar
slug: more-progress-bar
focus: /style.css
template: default
---

## Styling the `<progress>`

Now that the default appearance is turned off, we can start customizing the element. Progress bar consists of two parts:

- `progress-bar`
- `progress-value`

Note: this part is not a standardized CSS yet, so when creating these two selectors we will have to use the `-webkit-` vendor prefix, making them into:

```css
progress::-webkit-progress-bar {
  /* ... */
}

progress::-webkit-progress-value {
  /* ... */
}
```

In `style.css` you already see these selectors. Try styling them up: set `background` and `border-radius` to values you like!
