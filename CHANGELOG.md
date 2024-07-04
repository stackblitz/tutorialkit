## [0.0.1-alpha.24](https://github.com/stackblitz/tutorialkit/compare/0.0.1-alpha.23...0.0.1-alpha.24) (2024-07-04)

Special thanks to [@leonyoung1](https://github.com/leonyoung1) for their first contribution!! 🥳

### Bug Fixes

* **cli:** remove title from tutorial meta file ([#86](https://github.com/stackblitz/tutorialkit/issues/86)) ([c2f7688](https://github.com/stackblitz/tutorialkit/commit/c2f7688b27074c6261f025525437bccea9431fd3))
* editor ignoring changes ([#102](https://github.com/stackblitz/tutorialkit/issues/102)) ([0f01e31](https://github.com/stackblitz/tutorialkit/commit/0f01e317d449761fb7da8291119e57bd1d934e79))
* generate correct changelogs when doing a PR ([#113](https://github.com/stackblitz/tutorialkit/issues/113)) ([8b8b1ca](https://github.com/stackblitz/tutorialkit/commit/8b8b1caea8793748d9946e163a184a3ecb958358))
* problem with creating lessons without solution files ([#108](https://github.com/stackblitz/tutorialkit/issues/108)) ([2d51ff7](https://github.com/stackblitz/tutorialkit/commit/2d51ff713688e34cf3e6140ff4ac4df2a574f6a4))
* support a base different from / in astro config ([#92](https://github.com/stackblitz/tutorialkit/issues/92)) ([3e7830b](https://github.com/stackblitz/tutorialkit/commit/3e7830be7ed1fda9598c569eaad9878aa9d10156))
* **theme:** fix some styling for the editor ([#100](https://github.com/stackblitz/tutorialkit/issues/100)) ([0f5dd45](https://github.com/stackblitz/tutorialkit/commit/0f5dd4540cf65535ce3b834846f7dd2029551987))
* **theme:** invalid CSS variable on cm-gutter ([#98](https://github.com/stackblitz/tutorialkit/issues/98)) ([039f871](https://github.com/stackblitz/tutorialkit/commit/039f8714df8401a81472d134786029212c7d0d44))
* **theme:** set correct background and text color for panels ([#94](https://github.com/stackblitz/tutorialkit/issues/94)) ([3ad01a0](https://github.com/stackblitz/tutorialkit/commit/3ad01a0cc1055c1f1ffd7b220785f4be1d8d0669))
* **theme:** use correct tokens for the breadcrumbs ([#88](https://github.com/stackblitz/tutorialkit/issues/88)) ([1669299](https://github.com/stackblitz/tutorialkit/commit/1669299c988b8680dda4360e8f02d64c601ad48d))
* update `pnpm/action-setup` to v4 to fix CI issue ([#114](https://github.com/stackblitz/tutorialkit/issues/114)) ([e36c455](https://github.com/stackblitz/tutorialkit/commit/e36c455a783b5f79c9f321b865eedcd215bcf107))


### Features

* add `@tutorialkit/theme` package to use the theme without astro ([#105](https://github.com/stackblitz/tutorialkit/issues/105)) ([9805996](https://github.com/stackblitz/tutorialkit/commit/9805996a4211a1c8a3e1bfbbd958a27f1957d4d7))
* add eslint ([#90](https://github.com/stackblitz/tutorialkit/issues/90)) ([fcfb3e8](https://github.com/stackblitz/tutorialkit/commit/fcfb3e8109b5be1ef59ac2bfd8efd4db8e635e34))
* allow custom `src/pages/index.astro` ([#93](https://github.com/stackblitz/tutorialkit/issues/93)) ([d431d4d](https://github.com/stackblitz/tutorialkit/commit/d431d4d4908f28184cd7d2f75faffe2c77a3ef4c))
* allow ordering to be config based in addition to folder based ([#79](https://github.com/stackblitz/tutorialkit/issues/79)) ([2b131e5](https://github.com/stackblitz/tutorialkit/commit/2b131e597b94671678c2f2e4625e194eb382dab0))
* make core react components easily accessible ([#104](https://github.com/stackblitz/tutorialkit/issues/104)) ([d8a5a34](https://github.com/stackblitz/tutorialkit/commit/d8a5a341df6c2d23d1d59ede61b4d3ef689af081))
* make the logo link configurable ([#68](https://github.com/stackblitz/tutorialkit/issues/68)) ([2da64ae](https://github.com/stackblitz/tutorialkit/commit/2da64ae811cbb12aeab8fd1fb36bed4845542aa4))
* mobile support ([#91](https://github.com/stackblitz/tutorialkit/issues/91)) ([030ca1e](https://github.com/stackblitz/tutorialkit/commit/030ca1ee688f75f6e59ae25a1b2433823ade384f))
* template inheritance ([#99](https://github.com/stackblitz/tutorialkit/issues/99)) ([c4350a8](https://github.com/stackblitz/tutorialkit/commit/c4350a8032d0d24ac9250be8b81869ddae88a538))
* **terminal:** add support for redirects and allow specific commands ([#76](https://github.com/stackblitz/tutorialkit/issues/76)) ([eca5f22](https://github.com/stackblitz/tutorialkit/commit/eca5f22e3120c4d59349f416322b990d37cb0c15))
* **theme:** add support for setting text and code colors in callouts ([#96](https://github.com/stackblitz/tutorialkit/issues/96)) ([623b04d](https://github.com/stackblitz/tutorialkit/commit/623b04da18e5545a6d29b03a60571b1fb5bc2db1))
* **theme:** create proper tokens for callouts ([#87](https://github.com/stackblitz/tutorialkit/issues/87)) ([6d01620](https://github.com/stackblitz/tutorialkit/commit/6d01620f65c2386d98864246f8fe87e53c76c78f))



## [0.0.1-alpha.23](https://github.com/stackblitz/tutorialkit/compare/0.0.1-alpha.22...0.0.1-alpha.23) (2024-06-14)

Special thanks to @EmNudge and @morinokami for their first contributions!! 🥳

### Bug Fixes

* feature request issue template ([cc8423a](https://github.com/stackblitz/tutorialkit/commit/cc8423abe2c613f82d73179ca82f39e4ac0929c9))
* generate root changelog + changelog per package ([24d4131](https://github.com/stackblitz/tutorialkit/commit/24d4131ff5ffca9fde614cb3dd7682d6eca60433))
* hydration error after runtime refactor ([#63](https://github.com/stackblitz/tutorialkit/issues/63)) ([8f90338](https://github.com/stackblitz/tutorialkit/commit/8f9033816cd122be49ade2b85e0040469ed9fb1c))
* ignore platform specific files ([#69](https://github.com/stackblitz/tutorialkit/issues/69)) ([186e2db](https://github.com/stackblitz/tutorialkit/commit/186e2dba86b529fcc5816861e689edf128f520e2))
* **logo:** support multiple formats and remove styling requirements ([#62](https://github.com/stackblitz/tutorialkit/issues/62)) ([79cb18d](https://github.com/stackblitz/tutorialkit/commit/79cb18dca4e6b80a1f12ec96e1e627678f7b377d))
* **nav:** make sure nav is on top of the content ([#72](https://github.com/stackblitz/tutorialkit/issues/72)) ([cd4ecc7](https://github.com/stackblitz/tutorialkit/commit/cd4ecc756dde3d2d74326154c7ba700c967f8b97))
* sort navigation items numerically in `objectToSortedArray` function ([#56](https://github.com/stackblitz/tutorialkit/issues/56)) ([e45f62b](https://github.com/stackblitz/tutorialkit/commit/e45f62b68952228dd1facd55c2db5bd9f5247e42))
* support inheritance for `editor`/`focus` and fix bug with logo ([#67](https://github.com/stackblitz/tutorialkit/issues/67)) ([a7eb31d](https://github.com/stackblitz/tutorialkit/commit/a7eb31dcaa039292870a78fae979efd6c0ece134))
* **validation:** allow activePanel to be 0 ([#46](https://github.com/stackblitz/tutorialkit/issues/46)) ([4ab76f5](https://github.com/stackblitz/tutorialkit/commit/4ab76f54e94dd7d47400ae558257f23763919ea9))


### Features

* add create-tutorial package ([#47](https://github.com/stackblitz/tutorialkit/issues/47)) ([e720657](https://github.com/stackblitz/tutorialkit/commit/e7206578ac29212cab211f988ea2c8f7dcbe00d1))
* add lezer support for wast via codemirror wast package ([#65](https://github.com/stackblitz/tutorialkit/issues/65)) ([0ce2986](https://github.com/stackblitz/tutorialkit/commit/0ce2986077a5c8384a7f118bab9d8820ff707c72))
* add MDX extension to `recommendations` in extensions.json ([#55](https://github.com/stackblitz/tutorialkit/issues/55)) ([2d0a1fa](https://github.com/stackblitz/tutorialkit/commit/2d0a1fafab4d65236e196fe101e26535a24b3105))
* allow custom components that modify the tutorial state ([#64](https://github.com/stackblitz/tutorialkit/issues/64)) ([1279917](https://github.com/stackblitz/tutorialkit/commit/1279917be042580033f23605e92f903ecd186e19))
* hot reload for files in webcontainer ([#61](https://github.com/stackblitz/tutorialkit/issues/61)) ([949fcf3](https://github.com/stackblitz/tutorialkit/commit/949fcf3438e3bf17902d753089372fbc03911136))
* set default package manager to the one used with `create` command ([#57](https://github.com/stackblitz/tutorialkit/issues/57)) ([c97278e](https://github.com/stackblitz/tutorialkit/commit/c97278e94292a2f4cfd76a75cb31e540b5c0d230))
* **store:** fix current document and add onDocumentChanged ([#74](https://github.com/stackblitz/tutorialkit/issues/74)) ([05b1688](https://github.com/stackblitz/tutorialkit/commit/05b1688718ab6e8d7d55c09e892c7f1faef9116e))



