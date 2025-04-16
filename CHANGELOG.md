# [1.5.0](https://github.com/stackblitz/tutorialkit/compare/1.4.0...1.5.0) (2025-04-16)


### Bug Fixes

* **react:** allow preview panel to be fully collapsed ([#445](https://github.com/stackblitz/tutorialkit/issues/445)) ([11aa9ad](https://github.com/stackblitz/tutorialkit/commit/11aa9ad338de76cf0fe18d18d889504faea1c40c))


### Features

* **astro:** custom expressive code plugins ([#444](https://github.com/stackblitz/tutorialkit/issues/444)) ([d586225](https://github.com/stackblitz/tutorialkit/commit/d586225d11e900b6a63d7e3c9afdf1d04aa6485c))
* **astro:** preserve file path for imported file code blocks ([#446](https://github.com/stackblitz/tutorialkit/issues/446)) ([df69da2](https://github.com/stackblitz/tutorialkit/commit/df69da20e01d4cbed26a3f314f787e4e1ed015b9))



# [1.4.0](https://github.com/stackblitz/tutorialkit/compare/1.3.1...1.4.0) (2025-03-31)


### Features

* **astro:** add sensible default canonical url ([#437](https://github.com/stackblitz/tutorialkit/issues/437)) ([1a5ea33](https://github.com/stackblitz/tutorialkit/commit/1a5ea333744c524316a5d6348d8bd0ccf2e76ca7))
* **cli:** project creation to prompt hosting provider settings ([#440](https://github.com/stackblitz/tutorialkit/issues/440)) ([efd7ee7](https://github.com/stackblitz/tutorialkit/commit/efd7ee73382dc4f627b38a7ee731cb96bc3420b8))



## [1.3.1](https://github.com/stackblitz/tutorialkit/compare/1.3.0...1.3.1) (2024-11-25)


### Bug Fixes

* **astro:** allow URLs in `meta.image` ([#422](https://github.com/stackblitz/tutorialkit/issues/422)) ([3125547](https://github.com/stackblitz/tutorialkit/commit/3125547c043fe4a76dca95b1eb973362967ccf02))
* switch default `meta.image` to `.png` ([#427](https://github.com/stackblitz/tutorialkit/issues/427)) ([d39bf40](https://github.com/stackblitz/tutorialkit/commit/d39bf404bc1947c48b5cb15164f20f67c0be49bc))
* warn when using `.svg` in `meta.image` ([#377](https://github.com/stackblitz/tutorialkit/issues/377)) ([6e1edc1](https://github.com/stackblitz/tutorialkit/commit/6e1edc1af274d0eb65587f358e5db9557d259171))



# [1.3.0](https://github.com/stackblitz/tutorialkit/compare/1.2.2...1.3.0) (2024-11-15)


### Bug Fixes

* remove `downloadAsZip` from template for now ([#416](https://github.com/stackblitz/tutorialkit/issues/416)) ([705fead](https://github.com/stackblitz/tutorialkit/commit/705fead006988a4ae865c9171062bd7d3afb3206))


### Features

* **astro:** add "Download lesson as zip" button ([#415](https://github.com/stackblitz/tutorialkit/issues/415)) ([9c6e534](https://github.com/stackblitz/tutorialkit/commit/9c6e5349b6ab7e7399437839f6fc4cf11bd6c5c3))
* **astro:** support lessons without parts or chapters ([#374](https://github.com/stackblitz/tutorialkit/issues/374)) ([8c44cbe](https://github.com/stackblitz/tutorialkit/commit/8c44cbec3f276a4f788b5d1652f67e4cf8cf7948))



## [1.2.2](https://github.com/stackblitz/tutorialkit/compare/1.2.1...1.2.2) (2024-11-12)


### Bug Fixes

* hide preview container when `previews: false` ([#412](https://github.com/stackblitz/tutorialkit/issues/412)) ([b35de43](https://github.com/stackblitz/tutorialkit/commit/b35de43d437492d124af232adddd2a30ec70ec0e))



## [1.2.1](https://github.com/stackblitz/tutorialkit/compare/1.2.0...1.2.1) (2024-11-05)


### Bug Fixes

* **astro:** optimize CJS dependency `picomatch` ([#406](https://github.com/stackblitz/tutorialkit/issues/406)) ([17a48a6](https://github.com/stackblitz/tutorialkit/commit/17a48a6858912277942d87b8af28a601adfad8da))



# [1.2.0](https://github.com/stackblitz/tutorialkit/compare/1.1.1...1.2.0) (2024-11-05)


### Bug Fixes

* **react:** file tree scroll visibility ([#399](https://github.com/stackblitz/tutorialkit/issues/399)) ([e1e9160](https://github.com/stackblitz/tutorialkit/commit/e1e916044cc225dab925bd846d9208181f2080e1))


### Features

* **runtime:** `fs.watch` to support syncing new files from webcontainer ([#394](https://github.com/stackblitz/tutorialkit/issues/394)) ([3beda90](https://github.com/stackblitz/tutorialkit/commit/3beda905df20ed9c7d286fc02007cf5b2e74835a))



## [1.1.1](https://github.com/stackblitz/tutorialkit/compare/1.1.0...1.1.1) (2024-10-20)


### Bug Fixes

* **theme:** apply `fast-glob` Windows work-around for all `\@` matches ([#383](https://github.com/stackblitz/tutorialkit/issues/383)) ([9f4bd13](https://github.com/stackblitz/tutorialkit/commit/9f4bd13270f877b9f52e6b85eca5693c283ee249))



# [1.1.0](https://github.com/stackblitz/tutorialkit/compare/1.0.0...1.1.0) (2024-10-18)


### Bug Fixes

* **astro:** correct error message when chapter not found ([#361](https://github.com/stackblitz/tutorialkit/issues/361)) ([0510474](https://github.com/stackblitz/tutorialkit/commit/05104741a73180dbaeb583317cd77df104d2d2c7))
* **astro:** types of override components to optional ([#376](https://github.com/stackblitz/tutorialkit/issues/376)) ([0af3848](https://github.com/stackblitz/tutorialkit/commit/0af384889f5a3e7e46ea4803b1b1a631c15d331f))
* **cli:** list `eject` command in `--help` ([#373](https://github.com/stackblitz/tutorialkit/issues/373)) ([bc61229](https://github.com/stackblitz/tutorialkit/commit/bc61229f156db3043b57dd3f85f09b72702a70b0))


### Features

* add file extension based icons ([#369](https://github.com/stackblitz/tutorialkit/issues/369)) ([ff39cdc](https://github.com/stackblitz/tutorialkit/commit/ff39cdc258764c8d4d1bebe2dce2795fe10e1870))
* **astro:** add `custom` configuration option for passing custom fields ([#378](https://github.com/stackblitz/tutorialkit/issues/378)) ([7c6ede9](https://github.com/stackblitz/tutorialkit/commit/7c6ede95730150b68be763d4c87f1da1bc42503c))
* **astro:** override components to support `HeadTags` ([#375](https://github.com/stackblitz/tutorialkit/issues/375)) ([e93d11a](https://github.com/stackblitz/tutorialkit/commit/e93d11a11b8a01dc6de859842b0dc675b01008de))



# [1.0.0](https://github.com/stackblitz/tutorialkit/compare/0.2.3...1.0.0) (2024-10-01)


### Bug Fixes

* **astro:** better default meta tags ([#342](https://github.com/stackblitz/tutorialkit/issues/342)) ([d81d1cc](https://github.com/stackblitz/tutorialkit/commit/d81d1cc01fdbce702ae91a6a5f371bd03c38b338))
* **astro:** published package missing `@tutorialkit/astro/types` ([#347](https://github.com/stackblitz/tutorialkit/issues/347)) ([f49e910](https://github.com/stackblitz/tutorialkit/commit/f49e9107d35b98079a0fb16c74b9f37a45357661))
* prevent overwriting template files via `<FileTree>` ([#336](https://github.com/stackblitz/tutorialkit/issues/336)) ([23ed41c](https://github.com/stackblitz/tutorialkit/commit/23ed41c827073a205a2ceaa78973a9200a84c72d))


### Features

* add files via file tree ([#314](https://github.com/stackblitz/tutorialkit/issues/314)) ([7782bdc](https://github.com/stackblitz/tutorialkit/commit/7782bdc6e7da0429061c881ac2f95829f149a907))
* **astro:** override components to support `Dialog` ([#345](https://github.com/stackblitz/tutorialkit/issues/345)) ([61a542e](https://github.com/stackblitz/tutorialkit/commit/61a542e7e13b3eaf52b04624954398a8d95a8d46))
* mark `@tutorialkit/react` component API as experimental feature ([#346](https://github.com/stackblitz/tutorialkit/issues/346)) ([67042ef](https://github.com/stackblitz/tutorialkit/commit/67042efba00dbfa738d2eeff06e3104b4292a486))
* **runtime:** add `terminal.input` for writing to stdin ([#350](https://github.com/stackblitz/tutorialkit/issues/350)) ([c0b8f41](https://github.com/stackblitz/tutorialkit/commit/c0b8f41a28259cc19d7049be2506a5b246d6f32d))
* support glob patterns in `editor.fileTree.allowEdits` ([#332](https://github.com/stackblitz/tutorialkit/issues/332)) ([c1a59f5](https://github.com/stackblitz/tutorialkit/commit/c1a59f54c5b5700b8ec8ed5a4a3ebf2169b2409c))
* sync files from WebContainer to editor ([#334](https://github.com/stackblitz/tutorialkit/issues/334)) ([5c1de69](https://github.com/stackblitz/tutorialkit/commit/5c1de69c0e4e233a25a2f9b70fbb1f6c93f12356))


### BREAKING CHANGES

* mark `@tutorialkit/react` component API as experimental feature (#346)



## [0.2.3](https://github.com/stackblitz/tutorialkit/compare/0.2.2...0.2.3) (2024-09-10)


### Bug Fixes

* **react:** stale lesson data after navigation ([#318](https://github.com/stackblitz/tutorialkit/issues/318)) ([2b5fc92](https://github.com/stackblitz/tutorialkit/commit/2b5fc92fe962fee63b4d2f2efcce04602157268b))



## [0.2.2](https://github.com/stackblitz/tutorialkit/compare/0.2.1...0.2.2) (2024-09-04)


### Bug Fixes

* align `Powered by WebContainers` to the bottom ([#301](https://github.com/stackblitz/tutorialkit/issues/301)) ([98ef05b](https://github.com/stackblitz/tutorialkit/commit/98ef05b828ff8f3ab45a49e62bf1a4b79e65acfc))
* **react:** refresh preview when `autoReload: true` ([#303](https://github.com/stackblitz/tutorialkit/issues/303)) ([9754b26](https://github.com/stackblitz/tutorialkit/commit/9754b2671c9e896a63ca49053fc1dde78a88e0c7))


### Features

* **react:** add button to reload a preview ([#305](https://github.com/stackblitz/tutorialkit/issues/305)) ([d14c404](https://github.com/stackblitz/tutorialkit/commit/d14c4045ad692a45b5b388bb4cfcca9762e6142c))



## [0.2.1](https://github.com/stackblitz/tutorialkit/compare/0.2.0...0.2.1) (2024-08-30)


### Bug Fixes

* **astro:** work-around for dev-mode's `ReferenceError: __WC_CONFIG__ is not defined` errors ([#293](https://github.com/stackblitz/tutorialkit/issues/293)) ([70fa3e2](https://github.com/stackblitz/tutorialkit/commit/70fa3e2895f2f2c4d25aa3410690297afb49a44b))



# [0.2.0](https://github.com/stackblitz/tutorialkit/compare/0.1.6...0.2.0) (2024-08-28)


### Features

* rename `@tutorialkit/components-react` to `@tutorialkit/react` ([#155](https://github.com/stackblitz/tutorialkit/issues/155)) ([e3c0fee](https://github.com/stackblitz/tutorialkit/commit/e3c0fee902a7bfc312fb01b30531209815d460c3))
* simplify UnoCSS integration ([#270](https://github.com/stackblitz/tutorialkit/issues/270)) ([8d49ef8](https://github.com/stackblitz/tutorialkit/commit/8d49ef81272d84cbfa2c1a10742f01540fe3650c))


### BREAKING CHANGES

* rename `@tutorialkit/components-react` to `@tutorialkit/react` (#155)
* simplify UnoCSS integration (#270)



## [0.1.6](https://github.com/stackblitz/tutorialkit/compare/0.1.5...0.1.6) (2024-08-26)


### Bug Fixes

* **astro/types:** `webcontainer` should be a `Promise<WebContainer>` ([#259](https://github.com/stackblitz/tutorialkit/issues/259)) ([c7bad20](https://github.com/stackblitz/tutorialkit/commit/c7bad203045b702afda3176cece645bee4d4f6e3))
* **cli:** `create-tutorial` not depending on `@tutorialkit/cli` package ([#254](https://github.com/stackblitz/tutorialkit/issues/254)) ([3b480db](https://github.com/stackblitz/tutorialkit/commit/3b480dbd682a8c7657151dc93054f8209fdad312))
* missing preview i18n ([#255](https://github.com/stackblitz/tutorialkit/issues/255)) ([095ed57](https://github.com/stackblitz/tutorialkit/commit/095ed570702d1b8de9370565b94103cd0740c408))
* **react:** editor and preview missing accessible names ([#267](https://github.com/stackblitz/tutorialkit/issues/267)) ([bcbffe6](https://github.com/stackblitz/tutorialkit/commit/bcbffe6df0321aca1f649d26b09d9c3c8f8e4b7c))
* **react:** file tree's files to indicate selected state ([#268](https://github.com/stackblitz/tutorialkit/issues/268)) ([bd8a3be](https://github.com/stackblitz/tutorialkit/commit/bd8a3be8165b4a66efd550370fd5a7bebb9e62aa))
* **react:** solve-button not working before lesson loads ([#266](https://github.com/stackblitz/tutorialkit/issues/266)) ([547e70a](https://github.com/stackblitz/tutorialkit/commit/547e70a090d4509a60e9fc776f5abd3eb4315477))


### Features

* add Vue language to CodeMirror ([#256](https://github.com/stackblitz/tutorialkit/issues/256)) ([f9b265f](https://github.com/stackblitz/tutorialkit/commit/f9b265f7372c8246a4ccf2d41f0be8fe44d30aa7))
* **runtime:** option for setting terminal open by default ([#246](https://github.com/stackblitz/tutorialkit/issues/246)) ([5419038](https://github.com/stackblitz/tutorialkit/commit/5419038d1c0a6f80da4d9f31e330d0dc0e41def8))



## [0.1.5](https://github.com/stackblitz/tutorialkit/compare/0.1.4...0.1.5) (2024-08-16)


### Bug Fixes

* **astro:** don't modify state during re-renders of `<WorkspacePanelWrapper />` ([#240](https://github.com/stackblitz/tutorialkit/issues/240)) ([745be37](https://github.com/stackblitz/tutorialkit/commit/745be37ef20ae97d6ded221fca24670742981879))
* **extension:** only match tutorialkit content and meta files ([#242](https://github.com/stackblitz/tutorialkit/issues/242)) ([9c1b55a](https://github.com/stackblitz/tutorialkit/commit/9c1b55abd0967053782458db4ee41180f26d6c5d))


### Features

* **runtime:** add `preview.pathname` ([#233](https://github.com/stackblitz/tutorialkit/issues/233)) ([9bf2156](https://github.com/stackblitz/tutorialkit/commit/9bf2156df26656427482645d3d134127863de233))



## [0.1.4](https://github.com/stackblitz/tutorialkit/compare/0.1.3...0.1.4) (2024-08-08)


### Bug Fixes

* **astro:** sub folders not working on Windows ([#225](https://github.com/stackblitz/tutorialkit/issues/225)) ([694f5ca](https://github.com/stackblitz/tutorialkit/commit/694f5ca26dafae33554136ffbedea70c6c87585c))
* **astro:** webcontainers link to be in plural ([#227](https://github.com/stackblitz/tutorialkit/issues/227)) ([0b86ebd](https://github.com/stackblitz/tutorialkit/commit/0b86ebd4e6e2b28dd2ef0ff97a5c66f9eb780973))


### Features

* **extension:** support config-based ordering ([#223](https://github.com/stackblitz/tutorialkit/issues/223)) ([3b2c776](https://github.com/stackblitz/tutorialkit/commit/3b2c7763a9af488bf32586708b2af328256e0c41))



## [0.1.3](https://github.com/stackblitz/tutorialkit/compare/0.1.2...0.1.3) (2024-08-07)


### Features

* add 'Open in StackBlitz'-button ([#219](https://github.com/stackblitz/tutorialkit/issues/219)) ([af428c8](https://github.com/stackblitz/tutorialkit/commit/af428c84f0cd817debd336dc43e88c19583800ce))
* add link to webcontainers.io ([#202](https://github.com/stackblitz/tutorialkit/issues/202)) ([70d20c7](https://github.com/stackblitz/tutorialkit/commit/70d20c7b3801b458aa11c7d70a11ea1392d0fa60))
* add Svelte language to CodeMirror ([#212](https://github.com/stackblitz/tutorialkit/issues/212)) ([359c0e0](https://github.com/stackblitz/tutorialkit/commit/359c0e05c91c437066ff9a19a61bb74365faf3f0))
* rename `tutorialkit` to `@tutorialkit/cli` ([#153](https://github.com/stackblitz/tutorialkit/issues/153)) ([2986157](https://github.com/stackblitz/tutorialkit/commit/298615748b1f2d3ea737c591ce193eb0d28407ca))



## [0.1.2](https://github.com/stackblitz/tutorialkit/compare/0.1.1...0.1.2) (2024-08-01)


### Bug Fixes

* ignore templates `node_modules` ([#198](https://github.com/stackblitz/tutorialkit/issues/198)) ([d7215ca](https://github.com/stackblitz/tutorialkit/commit/d7215ca2a080267a3cc2c660dc997665d2fcfc26))



## [0.1.1](https://github.com/stackblitz/tutorialkit/compare/0.1.0...0.1.1) (2024-07-30)


### Bug Fixes

* **cli:** normalize windows paths for `fast-glob` ([#184](https://github.com/stackblitz/tutorialkit/issues/184)) ([eaa9890](https://github.com/stackblitz/tutorialkit/commit/eaa9890da93169ec2e3249a6065501a1326b4df9))



# [0.1.0](https://github.com/stackblitz/tutorialkit/compare/0.0.3...0.1.0) (2024-07-25)


### Bug Fixes

* **cli:** remove vs code `settings.json` ([#173](https://github.com/stackblitz/tutorialkit/issues/173)) ([8dde2c3](https://github.com/stackblitz/tutorialkit/commit/8dde2c3248fe897921c1e928f5084c426270ede2))
* **docs:** jumping to bottom of getting started page ([#170](https://github.com/stackblitz/tutorialkit/issues/170)) ([55430f9](https://github.com/stackblitz/tutorialkit/commit/55430f9006427e9435e9ce7d1be62315c6575e2b))
* solve shows lesson-only files empty ([#168](https://github.com/stackblitz/tutorialkit/issues/168)) ([bbb13f7](https://github.com/stackblitz/tutorialkit/commit/bbb13f7251a5259a3f7b4fc8300d0b308828bd73))


### Features

* add `contentSchema` ([#156](https://github.com/stackblitz/tutorialkit/issues/156)) ([bc0fde2](https://github.com/stackblitz/tutorialkit/commit/bc0fde26025465f5ab1fa71613d92293f0dafa89))
* **cli:** add vs code extension to recommendations ([#172](https://github.com/stackblitz/tutorialkit/issues/172)) ([f6fd489](https://github.com/stackblitz/tutorialkit/commit/f6fd48986c4760447c11743174c3448b9b733c4f))
* **extension:** metadata autocompletion ([#143](https://github.com/stackblitz/tutorialkit/issues/143)) ([be0a096](https://github.com/stackblitz/tutorialkit/commit/be0a0965bbd7b553bc6b5b1f4019e22ee0651d30))



## [0.0.3](https://github.com/stackblitz/tutorialkit/compare/0.0.2...0.0.3) (2024-07-23)


### Bug Fixes

* **deps:** update `astro` for Node 18.18 compatibility ([#159](https://github.com/stackblitz/tutorialkit/issues/159)) ([4b50335](https://github.com/stackblitz/tutorialkit/commit/4b50335d284fd22d38d9dab2c0f85e219533a9e5))



## [0.0.2](https://github.com/stackblitz/tutorialkit/compare/0.0.1...0.0.2) (2024-07-17)



## [0.0.1](https://github.com/stackblitz/tutorialkit/compare/0.0.1-alpha.26...0.0.1) (2024-07-17)


### Bug Fixes

* a transition-theme class was missing for the content right border ([#139](https://github.com/stackblitz/tutorialkit/issues/139)) ([c75ef40](https://github.com/stackblitz/tutorialkit/commit/c75ef4089833b8974c2b0877535f1967065ef08a))
* **ci:** override @astrojs/language-server with an older version ([#145](https://github.com/stackblitz/tutorialkit/issues/145)) ([bf9119e](https://github.com/stackblitz/tutorialkit/commit/bf9119ef29913eadd66581a103c3b34d9bf58401))
* **extension:** setup CI and minor improvements ([#142](https://github.com/stackblitz/tutorialkit/issues/142)) ([5a1f108](https://github.com/stackblitz/tutorialkit/commit/5a1f1084d018de789eb563c5959f557658963168))


### Features

* add vscode extension ([#109](https://github.com/stackblitz/tutorialkit/issues/109)) ([33a69f9](https://github.com/stackblitz/tutorialkit/commit/33a69f9de5d163029b78133b129147ff23a6de0b))



## [0.0.1-alpha.26](https://github.com/stackblitz/tutorialkit/compare/0.0.1-alpha.25...0.0.1-alpha.26) (2024-07-15)


### Bug Fixes

* **ci:** use PAT to make sure release PRs trigger workflows ([#124](https://github.com/stackblitz/tutorialkit/issues/124)) ([5e1a8bc](https://github.com/stackblitz/tutorialkit/commit/5e1a8bc4a9a569b27da787cfa5459723321b45f7))
* mobile fixes and basic i18n support ([#127](https://github.com/stackblitz/tutorialkit/issues/127)) ([f85e8eb](https://github.com/stackblitz/tutorialkit/commit/f85e8eb6058473b0ad2e061d39e14d111f3f34fe))


### Features

* add "Edit this page" link ([#130](https://github.com/stackblitz/tutorialkit/issues/130)) ([dd9c52c](https://github.com/stackblitz/tutorialkit/commit/dd9c52c6f1d3c90cc1d993d8c0fec61dadfc5815))
* finalize basic i18n support ([#133](https://github.com/stackblitz/tutorialkit/issues/133)) ([09d8bf7](https://github.com/stackblitz/tutorialkit/commit/09d8bf7bd7673abb5b92b7de569daad1b44b07fd))



## [0.0.1-alpha.25](https://github.com/stackblitz/tutorialkit/compare/0.0.1-alpha.24...0.0.1-alpha.25) (2024-07-09)


### Bug Fixes

* tag should be the version without the 'v' ([#121](https://github.com/stackblitz/tutorialkit/issues/121)) ([d292d0b](https://github.com/stackblitz/tutorialkit/commit/d292d0b01b0f668a098c20d63bf819077574d31e))


### Features

* `tutorialkit eject` command ([#81](https://github.com/stackblitz/tutorialkit/issues/81)) ([c802668](https://github.com/stackblitz/tutorialkit/commit/c802668aa39875052ac917952bee8d491dde1557))
* support overriding `TopBar` ([#112](https://github.com/stackblitz/tutorialkit/issues/112)) ([3792aa9](https://github.com/stackblitz/tutorialkit/commit/3792aa99103ed2461c9b4922838fec7fbcb5dec7))



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



