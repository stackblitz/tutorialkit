# UI Tests

> Tests for verifying TutorialKit works as expected in the browser. Tests are run against locally linked `@tutorialkit` packages.

## Running

- `pnpm exec playwright install chromium --with-deps` - When running the tests first time
- `pnpm test`

## Development

- `pnpm start` - Starts example/fixture project's development server
- `pnpm test:ui` - Start Playwright in UI mode

## Structure

Test cases are located in `test` directory.
Each test file has its own `chapter`, that contains `lesson`s for test cases:

For example Navigation tests:

```
├── src/content/tutorial
│   └── tests
│       └──── navigation
│           ├── page-one
│           ├── page-three
│           └── page-two
└── test
    └── navigation.test.ts
```

Or File Tree tests:

```
├── src/content/tutorial
│   └── tests
│       └── file-tree
│           └── lesson-and-solution
└── test
    └── file-tree.test.ts
```
