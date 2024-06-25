---
type: lesson
title: A legend
slug: a-legend
focus: /index.html
---

Even with the default styling `<fieldset>` already visually separates one group of form controls from another.
It might be better to explain to a form user what each group represents. That's the purpose of a `<legend>` element.

Let's add a legend to each of our fieldsets:

```html add={2}
  <fieldset>
    <legend>Step 1</legend>
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
