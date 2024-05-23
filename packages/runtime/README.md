# @tutorialkit/runtime

A wrapper around the **[WebContainer API][webcontainer-api]** focused on providing the right abstractions to let you focus on building highly interactive tutorials.

The runtime exposes the following:

- `lessonFilesFetcher`: A singleton that lets you fetch the contents of the lesson files
- `TutorialRunner`: The API to manage your tutorial content in WebContainer

Only a single instance of `TutorialRunner` should be created in your application and its lifetime is bound by the lifetime of the WebContainer instance.

## License

MIT

Copyright (c) 2024–present [StackBlitz][stackblitz]

[stackblitz]: https://stackblitz.com/
[webcontainer-api]: https://webcontainers.io
