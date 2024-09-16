# @tutorialkit/runtime

A wrapper around the **[WebContainer API][webcontainer-api]** focused on providing the right abstractions to let you focus on building highly interactive tutorials.

The runtime exposes the following:

- `TutorialStore`: A store to manage your tutorial content in WebContainer and in your components.

Only a single instance of `TutorialStore` should be created in your application and its lifetime is bound by the lifetime of the WebContainer instance.

## License

MIT

Copyright (c) 2024–present [StackBlitz][stackblitz]

[stackblitz]: https://stackblitz.com/
[webcontainer-api]: https://webcontainers.io
