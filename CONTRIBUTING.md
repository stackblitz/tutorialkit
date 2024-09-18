# TutorialKit Contributing Guide

Hi! We are really excited that you are interested in contributing to TutorialKit. Before submitting your contribution, please make sure to take a moment and read through the following guide:

## Repo Setup

The TutorialKit repo is a monorepo using pnpm workspaces. The package manager used to install and link dependencies must be [pnpm](https://pnpm.io/). Package manager versioning is handled by [`packageManager`](https://nodejs.org/api/packages.html#packagemanager) field that's supported by [Node's Corepack](https://nodejs.org/api/corepack.html) and other tools.

To develop and test packages:

1. Clone this repository and navigate into the cloned directory.

```
git clone https://github.com/stackblitz/tutorialkit
cd tutorialkit
```

2. Run `pnpm install` in project's root folder

3. Run `pnpm run build` to build sources

4. Run `pnpm run dev` to build sources in watch mode
  - Development environment starts in http://localhost:4321/
  - You can use `TUTORIALKIT_VITE_INSPECT` environment variable to enable [`vite-plugin-inspect`](https://github.com/antfu-collective/vite-plugin-inspect) during deveplopment.

5. Run `pnpm run test` to run core tests

The monorepo consists of multiple packages that are grouped into following groups:

### Core Packages

These packages will be installed by the end-users in their `package.json`.

- `@tutorialkit/astro`
- `@tutorialkit/react`
- `@tutorialkit/runtime`
- `@tutorialkit/theme`
- `@tutorialkit/types`

### CLI Packages

The CLI packages are expected to be run by users using `npm create tutorial` and `npx tutorialkit` commands.
These should not be added to `package.json`.

- `@tutorialkit/cli`
- `create-tutorial`

## Testing TutorialKit against external packages

You may wish to test your locally-modified copy of TutorialKit against another package that is using it. For pnpm, after building TutorialKit, you can use [`pnpm.overrides`](https://pnpm.io/package_json#pnpmoverrides). Please note that `pnpm.overrides` must be specified in the root `package.json` and you must first list the package as a dependency in the root `package.json`:

```json
{
  "pnpm": {
    "overrides": {
      "@tutorialkit/astro": "file:../tutorialkit/packages/astro",
      "@tutorialkit/react": "file:../tutorialkit/packages/react",
      "@tutorialkit/runtime": "file:../tutorialkit/packages/runtime",
      "@tutorialkit/theme": "file:../tutorialkit/packages/theme",
      "@tutorialkit/types": "file:../tutorialkit/packages/types"
    }
  }
}
```

And re-run `pnpm install` to link the package.

## Pull Request Guidelines

- Checkout a topic branch from a base branch, e.g. `main`, and merge back against that branch.

- If adding a new feature:

  - Provide a convincing reason to add this feature. Ideally, you should open a suggestion issue first and have it approved before working on it.
  - Add accompanying test case.

- If fixing a bug:

  - If you are resolving a special issue, add `(fix #xxxx[,#xxxx])` (#xxxx is the issue id) in your PR title for a better release log, e.g. `fix: update entities encoding/decoding (fix #3899)`.
  - Provide a detailed description of the bug in the PR. Live demo preferred.
  - Add appropriate test coverage if applicable.

- It's OK to have multiple small commits as you work on the PR - GitHub can automatically squash them before merging.

- Make sure tests pass!

- Commit messages must follow the [commit message convention](./.github/commit-convention.md) so that changelogs can be automatically generated.
