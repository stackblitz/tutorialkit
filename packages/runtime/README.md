# @tutorialkit/runtime

A wrapper around the **[WebContainer API][webcontainer-api]** that focus on providing you with the right abstractions to let you focus on building your highly interactive tutorial.

This runtime exposes:

- `lessonFilesFetcher`: A singleton that lets you fetch a lesson's files content
- `TutorialRunner`: the API to manage your tutorial content in webcontainer.

Only a single instance of `TutorialRunner` should be created in your application and its lifetime is bound by the lifetime of the webcontainer instance.

## License

MIT

Copyright (c) 2024–present [StackBlitz][stackblitz]

[stackblitz]: https://stackblitz.com/
[webcontainer-api]: https://webcontainers.io
