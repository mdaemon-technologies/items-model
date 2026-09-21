# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.4] - 2026-05-19

### Added

- CJS, ESM and UMD tests for the distribution bundles.
- Type declarations for the `dist/src` modules.

### Changed

- Improved runtime validators and internal logic (safer type checks, attribute path handling, prototype-property guard, id handling).
- Regenerated the distribution bundles (CJS, ESM, UMD) and updated the dist type declarations.
- README: added an `addAll` example, documented the emitted events, corrected the `getCopy` comment to `undefined`, and renamed an example call to `setAttributesByAttribute`.
- Updated the build and test configuration (jest, rollup, tsconfig).

## [3.0.3] - 2026-05-18

Version 3.0.2 was never published to npm.

### Changed

- Updated `@mdaemon/emitter` to `^2.1.0` and refreshed dependencies.

## [3.0.1] - 2025-07-24

### Changed

- Updated the README.

## [3.0.0] - 2025-05-02

### Changed

- **BREAKING:** The library is now written in TypeScript with full type definitions.

## [2.1.2] - 2025-04-24

### Changed

- Updated `@mdaemon/emitter` to `^2.0.7`, and updated rollup to v4 along with its plugins.

## [2.1.1] - 2025-03-14

### Changed

- Updated package dependencies.

## [2.1.0] - 2024-08-08

### Changed

- Updated `@mdaemon/emitter` to `^1.4.0`.

## [2.0.0] - 2024-05-13

### Changed

- **BREAKING:** Instead of `window["items-model"]`, `window.ItemsModel` must be used for UMD builds.
- `items-model.umd.js` is now `main`.
- Updated `index.d.ts`.

## [1.4.2] - 2024-04-09

### Changed

- Updated `@mdaemon/emitter` to `^1.3.0`.

## [1.4.1] - 2024-04-08

### Added

- `.npmignore`.

## [1.4.0] - 2024-03-07

### Added

- `addAll` method, which accepts an array of objects.
- Documentation.

### Changed

- Refactored some code.

### Removed

- Deprecated code.

## [1.3.0] - 2024-01-04

### Added

- `getFirstByAttribute`, an alias for `getByAttribute`.
- `setAttributesByAttribute` method.

## [1.2.3] - 2023-12-18

### Added

- `-itemName` emit.

### Deprecated

- The `-itemName-id` emit.

## [1.2.2] - 2023-10-12

### Changed

- Updated the rollup plugins and jest, and added `@rollup/plugin-terser`.

## [1.2.1] - 2023-07-28

### Fixed

- `getIndex` returned `-1` when the index was `0`.

## [1.2.0] - 2023-07-28

### Changed

- Items are stored in a `Map` instead of an `Array` to improve performance.

## [1.1.0] - 2023-02-02

### Added

- `getCopy` method, so specific items can be copied instead of copying the entire array.

### Changed

- Changed how `getCopies` does copying; `structuredClone` is used if it exists.

### Fixed

- The internal `updateProps` method could result in unexpected behavior or a crash if invalid values were input.

## [1.0.3] - 2023-01-26

### Added

- A test.

### Changed

- Updated dependencies to the latest.

### Removed

- terser.

## [1.0.2] - 2023-01-19

### Added

- A test for `upsert` (alias of `insert`).

### Fixed

- Spelling error.

## [1.0.1] - 2023-01-13

### Added

- Jest tests.
- TypeScript declarations for the CJS and UMD files.

### Fixed

- README import and require statements, and some spelling errors.

## [1.0.0] - 2022-12-22

Initial release.

[3.0.4]: https://www.npmjs.com/package/@mdaemon/items-model/v/3.0.4
[3.0.3]: https://www.npmjs.com/package/@mdaemon/items-model/v/3.0.3
[3.0.1]: https://www.npmjs.com/package/@mdaemon/items-model/v/3.0.1
[3.0.0]: https://www.npmjs.com/package/@mdaemon/items-model/v/3.0.0
[2.1.2]: https://www.npmjs.com/package/@mdaemon/items-model/v/2.1.2
[2.1.1]: https://www.npmjs.com/package/@mdaemon/items-model/v/2.1.1
[2.1.0]: https://www.npmjs.com/package/@mdaemon/items-model/v/2.1.0
[2.0.0]: https://www.npmjs.com/package/@mdaemon/items-model/v/2.0.0
[1.4.2]: https://www.npmjs.com/package/@mdaemon/items-model/v/1.4.2
[1.4.1]: https://www.npmjs.com/package/@mdaemon/items-model/v/1.4.1
[1.4.0]: https://www.npmjs.com/package/@mdaemon/items-model/v/1.4.0
[1.3.0]: https://www.npmjs.com/package/@mdaemon/items-model/v/1.3.0
[1.2.3]: https://www.npmjs.com/package/@mdaemon/items-model/v/1.2.3
[1.2.2]: https://www.npmjs.com/package/@mdaemon/items-model/v/1.2.2
[1.2.1]: https://www.npmjs.com/package/@mdaemon/items-model/v/1.2.1
[1.2.0]: https://www.npmjs.com/package/@mdaemon/items-model/v/1.2.0
[1.1.0]: https://www.npmjs.com/package/@mdaemon/items-model/v/1.1.0
[1.0.3]: https://www.npmjs.com/package/@mdaemon/items-model/v/1.0.3
[1.0.2]: https://www.npmjs.com/package/@mdaemon/items-model/v/1.0.2
[1.0.1]: https://www.npmjs.com/package/@mdaemon/items-model/v/1.0.1
[1.0.0]: https://www.npmjs.com/package/@mdaemon/items-model/v/1.0.0
