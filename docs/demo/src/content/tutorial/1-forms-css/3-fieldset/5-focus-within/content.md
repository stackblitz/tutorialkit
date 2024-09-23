---
type: lesson
title: Focus within
slug: focus-within
focus: /style.css
---
A great way to give our visitors a pointer to where they are in the form is the `:focus` state. The most common way to apply it is by highlighting the currently focused form controls like buttons and inputs. But now that the fieldset provides us with a higher level of organization for the form, we can also highlight it to give even better visual guidance!

Although `<fieldset>` doesn't have its own `:focus` state, we can use a similar pseudo-selector, called `:focus-within`. It will match whenever a descendant of the targeted element gets focus. In the case of our form, we can add it on fieldset to make it apply style when an input inside focuses.

```css
fieldset:focus-within {
  background: #00a1;
  border-color: #00a6;
}

fieldset:focus-within legend {
  color: #00a9;
  border-color: #00a6;
}
```
