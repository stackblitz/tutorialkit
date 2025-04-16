# [1.5.0](https://github.com/stackblitz/tutorialkit/compare/1.4.0...1.5.0) "@tutorialkit/astro" (2025-04-16)


### Features

* **astro:** custom expressive code plugins ([#444](https://github.com/stackblitz/tutorialkit/issues/444)) ([d586225](https://github.com/stackblitz/tutorialkit/commit/d586225d11e900b6a63d7e3c9afdf1d04aa6485c))
* **astro:** preserve file path for imported file code blocks ([#446](https://github.com/stackblitz/tutorialkit/issues/446)) ([df69da2](https://github.com/stackblitz/tutorialkit/commit/df69da20e01d4cbed26a3f314f787e4e1ed015b9))



# [1.4.0](https://github.com/stackblitz/tutorialkit/compare/1.3.1...1.4.0) "@tutorialkit/astro" (2025-03-31)


### Features

* **astro:** add sensible default canonical url ([#437](https://github.com/stackblitz/tutorialkit/issues/437)) ([1a5ea33](https://github.com/stackblitz/tutorialkit/commit/1a5ea333744c524316a5d6348d8bd0ccf2e76ca7))



## [1.3.1](https://github.com/stackblitz/tutorialkit/compare/1.3.0...1.3.1) "@tutorialkit/astro" (2024-11-25)


### Bug Fixes

* **astro:** allow URLs in `meta.image` ([#422](https://github.com/stackblitz/tutorialkit/issues/422)) ([3125547](https://github.com/stackblitz/tutorialkit/commit/3125547c043fe4a76dca95b1eb973362967ccf02))
* switch default `meta.image` to `.png` ([#427](https://github.com/stackblitz/tutorialkit/issues/427)) ([d39bf40](https://github.com/stackblitz/tutorialkit/commit/d39bf404bc1947c48b5cb15164f20f67c0be49bc))
* warn when using `.svg` in `meta.image` ([#377](https://github.com/stackblitz/tutorialkit/issues/377)) ([6e1edc1](https://github.com/stackblitz/tutorialkit/commit/6e1edc1af274d0eb65587f358e5db9557d259171))



# [1.3.0](https://github.com/stackblitz/tutorialkit/compare/1.2.2...1.3.0) "@tutorialkit/astro" (2024-11-15)


### Features

* **astro:** add "Download lesson as zip" button ([#415](https://github.com/stackblitz/tutorialkit/issues/415)) ([9c6e534](https://github.com/stackblitz/tutorialkit/commit/9c6e5349b6ab7e7399437839f6fc4cf11bd6c5c3))
* **astro:** support lessons without parts or chapters ([#374](https://github.com/stackblitz/tutorialkit/issues/374)) ([8c44cbe](https://github.com/stackblitz/tutorialkit/commit/8c44cbec3f276a4f788b5d1652f67e4cf8cf7948))



## [1.2.2](https://github.com/stackblitz/tutorialkit/compare/1.2.1...1.2.2) "@tutorialkit/astro" (2024-11-12)


### Bug Fixes

* hide preview container when `previews: false` ([#412](https://github.com/stackblitz/tutorialkit/issues/412)) ([b35de43](https://github.com/stackblitz/tutorialkit/commit/b35de43d437492d124af232adddd2a30ec70ec0e))



## [1.2.1](https://github.com/stackblitz/tutorialkit/compare/1.2.0...1.2.1) "@tutorialkit/astro" (2024-11-05)


### Bug Fixes

* **astro:** optimize CJS dependency `picomatch` ([#406](https://github.com/stackblitz/tutorialkit/issues/406)) ([17a48a6](https://github.com/stackblitz/tutorialkit/commit/17a48a6858912277942d87b8af28a601adfad8da))



# [1.2.0](https://github.com/stackblitz/tutorialkit/compare/1.1.1...1.2.0) "@tutorialkit/astro" (2024-11-05)



## [1.1.1](https://github.com/stackblitz/tutorialkit/compare/1.1.0...1.1.1) "@tutorialkit/astro" (2024-10-20)



# [1.1.0](https://github.com/stackblitz/tutorialkit/compare/1.0.0...1.1.0) "@tutorialkit/astro" (2024-10-18)


### Bug Fixes

* **astro:** correct error message when chapter not found ([#361](https://github.com/stackblitz/tutorialkit/issues/361)) ([0510474](https://github.com/stackblitz/tutorialkit/commit/05104741a73180dbaeb583317cd77df104d2d2c7))
* **astro:** types of override components to optional ([#376](https://github.com/stackblitz/tutorialkit/issues/376)) ([0af3848](https://github.com/stackblitz/tutorialkit/commit/0af384889f5a3e7e46ea4803b1b1a631c15d331f))


### Features

* **astro:** override components to support `HeadTags` ([#375](https://github.com/stackblitz/tutorialkit/issues/375)) ([e93d11a](https://github.com/stackblitz/tutorialkit/commit/e93d11a11b8a01dc6de859842b0dc675b01008de))



# [1.0.0](https://github.com/stackblitz/tutorialkit/compare/0.2.3...1.0.0) "@tutorialkit/astro" (2024-10-01)


### Bug Fixes

* **astro:** better default meta tags ([#342](https://github.com/stackblitz/tutorialkit/issues/342)) ([d81d1cc](https://github.com/stackblitz/tutorialkit/commit/d81d1cc01fdbce702ae91a6a5f371bd03c38b338))
* **astro:** published package missing `@tutorialkit/astro/types` ([#347](https://github.com/stackblitz/tutorialkit/issues/347)) ([f49e910](https://github.com/stackblitz/tutorialkit/commit/f49e9107d35b98079a0fb16c74b9f37a45357661))


### Features

* add files via file tree ([#314](https://github.com/stackblitz/tutorialkit/issues/314)) ([7782bdc](https://github.com/stackblitz/tutorialkit/commit/7782bdc6e7da0429061c881ac2f95829f149a907))
* **astro:** override components to support `Dialog` ([#345](https://github.com/stackblitz/tutorialkit/issues/345)) ([61a542e](https://github.com/stackblitz/tutorialkit/commit/61a542e7e13b3eaf52b04624954398a8d95a8d46))
* support glob patterns in `editor.fileTree.allowEdits` ([#332](https://github.com/stackblitz/tutorialkit/issues/332)) ([c1a59f5](https://github.com/stackblitz/tutorialkit/commit/c1a59f54c5b5700b8ec8ed5a4a3ebf2169b2409c))
* sync files from WebContainer to editor ([#334](https://github.com/stackblitz/tutorialkit/issues/334)) ([5c1de69](https://github.com/stackblitz/tutorialkit/commit/5c1de69c0e4e233a25a2f9b70fbb1f6c93f12356))



## [0.2.3](https://github.com/stackblitz/tutorialkit/compare/0.2.2...0.2.3) "@tutorialkit/astro" (2024-09-10)



## [0.2.2](https://github.com/stackblitz/tutorialkit/compare/0.2.1...0.2.2) "@tutorialkit/astro" (2024-09-04)


### Bug Fixes

* align `Powered by WebContainers` to the bottom ([#301](https://github.com/stackblitz/tutorialkit/issues/301)) ([98ef05b](https://github.com/stackblitz/tutorialkit/commit/98ef05b828ff8f3ab45a49e62bf1a4b79e65acfc))


### Features

* **react:** add button to reload a preview ([#305](https://github.com/stackblitz/tutorialkit/issues/305)) ([d14c404](https://github.com/stackblitz/tutorialkit/commit/d14c4045ad692a45b5b388bb4cfcca9762e6142c))



## [0.2.1](https://github.com/stackblitz/tutorialkit/compare/0.2.0...0.2.1) "@tutorialkit/astro" (2024-08-30)


### Bug Fixes

* **astro:** work-around for dev-mode's `ReferenceError: __WC_CONFIG__ is not defined` errors ([#293](https://github.com/stackblitz/tutorialkit/issues/293)) ([70fa3e2](https://github.com/stackblitz/tutorialkit/commit/70fa3e2895f2f2c4d25aa3410690297afb49a44b))



# [0.2.0](https://github.com/stackblitz/tutorialkit/compare/0.1.6...0.2.0) "@tutorialkit/astro" (2024-08-28)


### Features

* rename `@tutorialkit/components-react` to `@tutorialkit/react` ([#155](https://github.com/stackblitz/tutorialkit/issues/155)) ([e3c0fee](https://github.com/stackblitz/tutorialkit/commit/e3c0fee902a7bfc312fb01b30531209815d460c3))
* simplify UnoCSS integration ([#270](https://github.com/stackblitz/tutorialkit/issues/270)) ([8d49ef8](https://github.com/stackblitz/tutorialkit/commit/8d49ef81272d84cbfa2c1a10742f01540fe3650c))


### BREAKING CHANGES

* rename `@tutorialkit/components-react` to `@tutorialkit/react` (#155)
* simplify UnoCSS integration (#270)



## [0.1.6](https://github.com/stackblitz/tutorialkit/compare/0.1.5...0.1.6) "@tutorialkit/astro" (2024-08-26)


### Bug Fixes

* **astro/types:** `webcontainer` should be a `Promise<WebContainer>` ([#259](https://github.com/stackblitz/tutorialkit/issues/259)) ([c7bad20](https://github.com/stackblitz/tutorialkit/commit/c7bad203045b702afda3176cece645bee4d4f6e3))
* missing preview i18n ([#255](https://github.com/stackblitz/tutorialkit/issues/255)) ([095ed57](https://github.com/stackblitz/tutorialkit/commit/095ed570702d1b8de9370565b94103cd0740c408))



## [0.1.5](https://github.com/stackblitz/tutorialkit/compare/0.1.4...0.1.5) "@tutorialkit/astro" (2024-08-16)


### Bug Fixes

* **astro:** don't modify state during re-renders of `<WorkspacePanelWrapper />` ([#240](https://github.com/stackblitz/tutorialkit/issues/240)) ([745be37](https://github.com/stackblitz/tutorialkit/commit/745be37ef20ae97d6ded221fca24670742981879))



## [0.1.4](https://github.com/stackblitz/tutorialkit/compare/0.1.3...0.1.4) "@tutorialkit/astro" (2024-08-08)


### Bug Fixes

* **astro:** sub folders not working on Windows ([#225](https://github.com/stackblitz/tutorialkit/issues/225)) ([694f5ca](https://github.com/stackblitz/tutorialkit/commit/694f5ca26dafae33554136ffbedea70c6c87585c))
* **astro:** webcontainers link to be in plural ([#227](https://github.com/stackblitz/tutorialkit/issues/227)) ([0b86ebd](https://github.com/stackblitz/tutorialkit/commit/0b86ebd4e6e2b28dd2ef0ff97a5c66f9eb780973))



## [0.1.3](https://github.com/stackblitz/tutorialkit/compare/0.1.2...0.1.3) "@tutorialkit/astro" (2024-08-07)


### Features

* add 'Open in StackBlitz'-button ([#219](https://github.com/stackblitz/tutorialkit/issues/219)) ([af428c8](https://github.com/stackblitz/tutorialkit/commit/af428c84f0cd817debd336dc43e88c19583800ce))
* add link to webcontainers.io ([#202](https://github.com/stackblitz/tutorialkit/issues/202)) ([70d20c7](https://github.com/stackblitz/tutorialkit/commit/70d20c7b3801b458aa11c7d70a11ea1392d0fa60))



## [0.1.2](https://github.com/stackblitz/tutorialkit/compare/0.1.1...0.1.2) "@tutorialkit/astro" (2024-08-01)


### Bug Fixes

* ignore templates `node_modules` ([#198](https://github.com/stackblitz/tutorialkit/issues/198)) ([d7215ca](https://github.com/stackblitz/tutorialkit/commit/d7215ca2a080267a3cc2c660dc997665d2fcfc26))



## [0.1.1](https://github.com/stackblitz/tutorialkit/compare/0.1.0...0.1.1) "@tutorialkit/astro" (2024-07-30)



# [0.1.0](https://github.com/stackblitz/tutorialkit/compare/0.0.3...0.1.0) "@tutorialkit/astro" (2024-07-25)



## [0.0.3](https://github.com/stackblitz/tutorialkit/compare/0.0.2...0.0.3) "@tutorialkit/astro" (2024-07-23)


### Bug Fixes

* **deps:** update `astro` for Node 18.18 compatibility ([#159](https://github.com/stackblitz/tutorialkit/issues/159)) ([4b50335](https://github.com/stackblitz/tutorialkit/commit/4b50335d284fd22d38d9dab2c0f85e219533a9e5))



## [0.0.2](https://github.com/stackblitz/tutorialkit/compare/0.0.1...0.0.2) "@tutorialkit/astro" (2024-07-17)



## [0.0.1](https://github.com/stackblitz/tutorialkit/compare/0.0.1-alpha.26...0.0.1) "@tutorialkit/astro" (2024-07-17)


### Bug Fixes

* a transition-theme class was missing for the content right border ([#139](https://github.com/stackblitz/tutorialkit/issues/139)) ([c75ef40](https://github.com/stackblitz/tutorialkit/commit/c75ef4089833b8974c2b0877535f1967065ef08a))



## [0.0.1-alpha.26](https://github.com/stackblitz/tutorialkit/compare/0.0.1-alpha.25...0.0.1-alpha.26) "@tutorialkit/astro" (2024-07-15)


### Bug Fixes

* mobile fixes and basic i18n support ([#127](https://github.com/stackblitz/tutorialkit/issues/127)) ([f85e8eb](https://github.com/stackblitz/tutorialkit/commit/f85e8eb6058473b0ad2e061d39e14d111f3f34fe))


### Features

* add "Edit this page" link ([#130](https://github.com/stackblitz/tutorialkit/issues/130)) ([dd9c52c](https://github.com/stackblitz/tutorialkit/commit/dd9c52c6f1d3c90cc1d993d8c0fec61dadfc5815))
* finalize basic i18n support ([#133](https://github.com/stackblitz/tutorialkit/issues/133)) ([09d8bf7](https://github.com/stackblitz/tutorialkit/commit/09d8bf7bd7673abb5b92b7de569daad1b44b07fd))



## [0.0.1-alpha.25](https://github.com/stackblitz/tutorialkit/compare/0.0.1-alpha.24...0.0.1-alpha.25) "@tutorialkit/astro" (2024-07-09)


### Features

* `tutorialkit eject` command ([#81](https://github.com/stackblitz/tutorialkit/issues/81)) ([c802668](https://github.com/stackblitz/tutorialkit/commit/c802668aa39875052ac917952bee8d491dde1557))
* support overriding `TopBar` ([#112](https://github.com/stackblitz/tutorialkit/issues/112)) ([3792aa9](https://github.com/stackblitz/tutorialkit/commit/3792aa99103ed2461c9b4922838fec7fbcb5dec7))



## [0.0.1-alpha.24](https://github.com/stackblitz/tutorialkit/compare/0.0.1-alpha.23...0.0.1-alpha.24) "@tutorialkit/astro" (2024-07-04)


### Bug Fixes

* support a base different from / in astro config ([#92](https://github.com/stackblitz/tutorialkit/issues/92)) ([3e7830b](https://github.com/stackblitz/tutorialkit/commit/3e7830be7ed1fda9598c569eaad9878aa9d10156))
* **theme:** set correct background and text color for panels ([#94](https://github.com/stackblitz/tutorialkit/issues/94)) ([3ad01a0](https://github.com/stackblitz/tutorialkit/commit/3ad01a0cc1055c1f1ffd7b220785f4be1d8d0669))
* **theme:** use correct tokens for the breadcrumbs ([#88](https://github.com/stackblitz/tutorialkit/issues/88)) ([1669299](https://github.com/stackblitz/tutorialkit/commit/1669299c988b8680dda4360e8f02d64c601ad48d))


### Features

* add `@tutorialkit/theme` package to use the theme without astro ([#105](https://github.com/stackblitz/tutorialkit/issues/105)) ([9805996](https://github.com/stackblitz/tutorialkit/commit/9805996a4211a1c8a3e1bfbbd958a27f1957d4d7))
* add eslint ([#90](https://github.com/stackblitz/tutorialkit/issues/90)) ([fcfb3e8](https://github.com/stackblitz/tutorialkit/commit/fcfb3e8109b5be1ef59ac2bfd8efd4db8e635e34))
* allow custom `src/pages/index.astro` ([#93](https://github.com/stackblitz/tutorialkit/issues/93)) ([d431d4d](https://github.com/stackblitz/tutorialkit/commit/d431d4d4908f28184cd7d2f75faffe2c77a3ef4c))
* allow ordering to be config based in addition to folder based ([#79](https://github.com/stackblitz/tutorialkit/issues/79)) ([2b131e5](https://github.com/stackblitz/tutorialkit/commit/2b131e597b94671678c2f2e4625e194eb382dab0))
* make the logo link configurable ([#68](https://github.com/stackblitz/tutorialkit/issues/68)) ([2da64ae](https://github.com/stackblitz/tutorialkit/commit/2da64ae811cbb12aeab8fd1fb36bed4845542aa4))
* mobile support ([#91](https://github.com/stackblitz/tutorialkit/issues/91)) ([030ca1e](https://github.com/stackblitz/tutorialkit/commit/030ca1ee688f75f6e59ae25a1b2433823ade384f))
* template inheritance ([#99](https://github.com/stackblitz/tutorialkit/issues/99)) ([c4350a8](https://github.com/stackblitz/tutorialkit/commit/c4350a8032d0d24ac9250be8b81869ddae88a538))
* **theme:** add support for setting text and code colors in callouts ([#96](https://github.com/stackblitz/tutorialkit/issues/96)) ([623b04d](https://github.com/stackblitz/tutorialkit/commit/623b04da18e5545a6d29b03a60571b1fb5bc2db1))
* **theme:** create proper tokens for callouts ([#87](https://github.com/stackblitz/tutorialkit/issues/87)) ([6d01620](https://github.com/stackblitz/tutorialkit/commit/6d01620f65c2386d98864246f8fe87e53c76c78f))



## [0.0.1-alpha.23](https://github.com/stackblitz/tutorialkit/compare/0.0.1-alpha.22...0.0.1-alpha.23) "@tutorialkit/astro" (2024-06-19)


### Bug Fixes

* ignore platform specific files ([#69](https://github.com/stackblitz/tutorialkit/issues/69)) ([186e2db](https://github.com/stackblitz/tutorialkit/commit/186e2dba86b529fcc5816861e689edf128f520e2))
* **logo:** support multiple formats and remove styling requirements ([#62](https://github.com/stackblitz/tutorialkit/issues/62)) ([79cb18d](https://github.com/stackblitz/tutorialkit/commit/79cb18dca4e6b80a1f12ec96e1e627678f7b377d))
* sort navigation items numerically in `objectToSortedArray` function ([#56](https://github.com/stackblitz/tutorialkit/issues/56)) ([e45f62b](https://github.com/stackblitz/tutorialkit/commit/e45f62b68952228dd1facd55c2db5bd9f5247e42))
* support inheritance for `editor`/`focus` and fix bug with logo ([#67](https://github.com/stackblitz/tutorialkit/issues/67)) ([a7eb31d](https://github.com/stackblitz/tutorialkit/commit/a7eb31dcaa039292870a78fae979efd6c0ece134))


### Features

* allow custom components that modify the tutorial state ([#64](https://github.com/stackblitz/tutorialkit/issues/64)) ([1279917](https://github.com/stackblitz/tutorialkit/commit/1279917be042580033f23605e92f903ecd186e19))
* hot reload for files in webcontainer ([#61](https://github.com/stackblitz/tutorialkit/issues/61)) ([949fcf3](https://github.com/stackblitz/tutorialkit/commit/949fcf3438e3bf17902d753089372fbc03911136))



