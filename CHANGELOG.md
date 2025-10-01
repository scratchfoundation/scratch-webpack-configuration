# Changelog

All notable changes to this project will be documented in this file. See
[Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [3.1.0](https://github.com/scratchfoundation/scratch-webpack-configuration/compare/v3.0.0...v3.1.0) (2025-10-01)


### Bug Fixes

* add cssModuleExceptions as [@param](https://github.com/param) ([7a4836f](https://github.com/scratchfoundation/scratch-webpack-configuration/commit/7a4836fe12cd916a060123a7468160343d4b1184))


### Features

* allow for css module exceptions ([121295f](https://github.com/scratchfoundation/scratch-webpack-configuration/commit/121295f943f012d1cf26ea41d75d5bcce30ea20e))

# [3.0.0](https://github.com/scratchfoundation/scratch-webpack-configuration/compare/v2.0.0...v3.0.0) (2024-11-25)


* chore!: set license to BSD-3-Clause ([3131686](https://github.com/scratchfoundation/scratch-webpack-configuration/commit/3131686f4fcdd91916f33af3e59fdaeacb425664))


### BREAKING CHANGES

* The license for this project has changed back to BSD-3-Clause

# [2.0.0](https://github.com/scratchfoundation/scratch-webpack-configuration/compare/v1.6.0...v2.0.0) (2024-11-25)


* chore!: set license to AGPL-3.0-only ([66e2456](https://github.com/scratchfoundation/scratch-webpack-configuration/commit/66e2456649350eab6c56f0d6255f3a65d6876eb1))


### BREAKING CHANGES

* This project is now licensed under the AGPL version 3.0

See https://www.scratchfoundation.org/open-source-license

# [1.6.0](https://github.com/scratchfoundation/scratch-webpack-configuration/compare/v1.5.1...v1.6.0) (2024-09-25)


### Bug Fixes

* update the file match that webpack should process from node_modules ([89d4f7d](https://github.com/scratchfoundation/scratch-webpack-configuration/commit/89d4f7de4cb60ab9f262bfb5e765d67c7fc367a1))


### Features

* add method for defining additional externals ([56c3806](https://github.com/scratchfoundation/scratch-webpack-configuration/commit/56c38066111ec5d67d1faf39dc4ddaea5a091f90))
* add TS support ([348a60a](https://github.com/scratchfoundation/scratch-webpack-configuration/commit/348a60a0744bd881da3de792b900d9ec76e4eead))
* default to publicPath: '/' and allow overrides ([ec47b45](https://github.com/scratchfoundation/scratch-webpack-configuration/commit/ec47b45ea04b884b75b1b7df9a1cf3acff9443fb))

## [1.5.1](https://github.com/scratchfoundation/scratch-webpack-configuration/compare/v1.5.0...v1.5.1) (2024-09-11)


### Bug Fixes

* **deps:** update dependency scratch-semantic-release-config to v1.0.16 ([22b5fb3](https://github.com/scratchfoundation/scratch-webpack-configuration/commit/22b5fb3bcfb4df3a4f06eb6f82398771fab8bbd7))

# [1.5.0](https://github.com/scratchfoundation/scratch-webpack-configuration/compare/v1.4.0...v1.5.0) (2024-09-07)


### Features

* support arraybuffer-loader through `?arrayBuffer` resource query ([2a263ff](https://github.com/scratchfoundation/scratch-webpack-configuration/commit/2a263ff6e5f7cf895fac09d42866f3b6cf912e7f))

# [1.4.0](https://github.com/scratchfoundation/scratch-webpack-configuration/compare/v1.3.0...v1.4.0) (2024-07-29)


### Bug Fixes

* [UEPR-30] Updated style-loader version to fix component not rendering ([12350ed](https://github.com/scratchfoundation/scratch-webpack-configuration/commit/12350eda5774dbbaeded5e83e6f2a4aac70707bc))


### Features

* [UEPR-27] Moved common rules to shared webpack configuration ([8693636](https://github.com/scratchfoundation/scratch-webpack-configuration/commit/8693636e6dac0d305bade76d2056d2be7bf0e13c))

# [1.3.0](https://github.com/scratchfoundation/scratch-webpack-configuration/compare/v1.2.0...v1.3.0) (2024-03-18)


### Features

* add "enableDevServer" helper ([44c7765](https://github.com/scratchfoundation/scratch-webpack-configuration/commit/44c77658baeafaa715354e5de884cfefbc74d278))
* add chunk splitting ([c1046e9](https://github.com/scratchfoundation/scratch-webpack-configuration/commit/c1046e9a91c778bb237a0a4214ebcd95d5bc188c))
* add rules for asset modules ([bde30f6](https://github.com/scratchfoundation/scratch-webpack-configuration/commit/bde30f62b08697dee68a2750cf5b2650699eaf67))

# [1.2.0](https://github.com/scratchfoundation/scratch-webpack-configuration/compare/v1.1.0...v1.2.0) (2024-03-14)


### Bug Fixes

* explicitly add defaults to resolve.extensions ([21ce9da](https://github.com/scratchfoundation/scratch-webpack-configuration/commit/21ce9da9df20c83bea9b9c57d8a9d8bef96e3831))


### Features

* add 'enableReact' flag ([61923a2](https://github.com/scratchfoundation/scratch-webpack-configuration/commit/61923a29883fb5089441b6bc3cd9f8e65a078c9d))
* let Babel process all source ([edb003a](https://github.com/scratchfoundation/scratch-webpack-configuration/commit/edb003a62e30ac327dd2d0d82202285370589828))
* support .cjs, .mjs, and their JSX friends ([0350e5d](https://github.com/scratchfoundation/scratch-webpack-configuration/commit/0350e5ddef03f825cd79100e3e2ee4156ee76957))

# [1.1.0](https://github.com/scratchfoundation/scratch-webpack-configuration/compare/v1.0.0...v1.1.0) (2024-03-09)


### Features

* add clone() method ([c2f5451](https://github.com/scratchfoundation/scratch-webpack-configuration/commit/c2f5451022f99951dd0a1725f5fb752514882229))

# 1.0.0 (2024-03-09)


### Bug Fixes

* recognize more browserslist targets ([75fd985](https://github.com/scratchfoundation/scratch-webpack-configuration/commit/75fd985720674b480e13ce5431114432360e2abe))


### Features

* make a generic webpack config ([a3aae22](https://github.com/scratchfoundation/scratch-webpack-configuration/commit/a3aae2277fa2ec97a4c3d9a89348846d024a1099))
