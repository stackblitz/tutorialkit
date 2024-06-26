---
type: lesson
title: Fieldset element
slug: fieldset-element
focus: /index.html
---

The `<fieldset>` HTML element groups related form controls, such as buttons, inputs, textareas, and labels, within a web form.

This allows you to apply common styling and functional rules to the entire set of elements. Let's take a closer look at working with fieldsets!

The current forms includes 6 inputs and we will want each pair to be visually and logically grouped together.

Create **3 fieldsets** by wrapping them around the markup responsible for displaing the form fields:

```html add={1,10}
  <fieldset>
    <div>
      <label for="q_1">First name:</label>
      <input id="q_1" />
    </div>
    <div>
      <label for="q_2">Last name:</label>
      <input id="q_2" />
    </div>
  </fieldset>
```
