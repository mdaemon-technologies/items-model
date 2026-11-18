# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.6] - 2026-11-18

### Changed: `@mdaemon/emitter` 3

- Updated `@mdaemon/emitter` from `^2.1.1` to `^3.1.0`. `ItemsModel` extends `Emitter`, and keeps the two emitter 2 behaviours that emitter 3.0.0 changed and that callers are most likely to depend on:
  - An exception thrown by an event handler still propagates out of the method that emitted the event (`add`, `addAll`, `setAttributes`, `setAttributesByAttribute`, `insert`, `update`, `remove`, `emit`), and later handlers for that event still do not run. `ItemsModel` passes emitter 3 an `onError` that rethrows.
  - Registering a handler again under the same event name and namespace still replaces the earlier one, in its place among handlers of the same priority and without counting toward the listener limit. `ItemsModel` overrides `register`, which `on`, `subscribe` and `onMany` also use, so `dist/items-model.d.ts` now declares `register`'s three overloads (unchanged from emitter's).
- `src/__tests__/items-model.events.test.ts` pins both, against the source and the built bundle. Apart from the one deliberate difference below, the same tests pass against 3.0.5's bundle, built with emitter 2.1.1. The smoke tests check both in all three bundles.
- These emitter 3 changes are kept, as fixes for emitter 2 bugs:
  - Registering something that is not a function throws a `TypeError` at once. Emitter 2 accepted it, and the next emit of that event threw, from inside `add`, `update` and the like.
  - Wildcards (`*`, `?`) must match the whole event name, and `.` is literal. With emitter 2, `user.*` also matched `superuser.created`.
  - `once` handlers fire in registration order rather than in reverse.
  - `config` is frozen, and declared `readonly`.
  - `once(name, namespace, func)` is new; `offAll(namespace)` and `isRegistered(name, namespace)` take one-time handlers' namespaces into account; and if a one-time handler throws, the other one-time handlers for that event are dropped rather than kept.
  - See the [emitter changelog](https://github.com/mdaemon-technologies/emitter/blob/main/CHANGELOG.md) for the full list.

### Added

- `CHANGELOG.md` is included in the published package.

- Smoke tests (`npm run test:smoke`) for the built bundles, using only `node:test`, so they run on every supported Node version. They load the package by name through `exports`, run the UMD bundle as a browser script and under a CommonJS loader, cover the `structuredClone` copy path, and check that the CJS, ESM and UMD bundles expose the same API.
- `npm run typecheck`, which now also type-checks the tests.
- ESLint 10 with typescript-eslint's recommended rules (`npm run lint`), run in CI and before `npm run pub`. `no-explicit-any` is off because the published API takes and returns `any` items by design. typescript-eslint does not support TypeScript 7 yet, so `typescript` is now an alias for `@typescript/typescript6` (the API it parses with), and TypeScript 7 is installed as `@typescript/native` and still provides `tsc`.

### Changed

- Build: Rollup replaced by Vite 8 (library mode). The bundles keep their file names, ES2015 target, minification and default export; `@mdaemon/emitter` is still bundled in. Type declarations are written by `tsc`.
- Tests: Jest replaced by Vitest 5; the `done`-callback tests now assert on recorded events.
- TypeScript 7.
- CI and the publish workflow install npm 11 before `npm ci`. `package-lock.json` is written by npm 11, and the npm 10 that Node 22 bundles rejects it as out of sync: it tries to fill typescript-eslint's unmet optional peer `@typescript/native` (which wants a TypeScript 7.1 nightly) with that day's nightly, where npm 11 leaves it unfilled. `src/__tests__/workflows.test.ts` keeps it that way, and checks that the Node 18 and 20 smoke jobs never install.
- Variables that are never reassigned are now declared with `const` (ESLint's `prefer-const`); no behavior change.
- CI builds and tests on Node 22, 24 and 26, and smoke-tests the built bundles on Node 18 and 20. The toolchain needs Node 22.12 or later; the package itself still supports Node 18.
- Publishing builds and tests once, smoke-tests that build on Node 18 and 20, and publishes exactly that build, with no dependency cache in the release workflow and npm pinned to major version 11.

### Removed

- Stale type declarations in `dist/` that no build produced any more: `dist/src/*.d.ts` and the per-bundle copies `items-model.{cjs,mjs,umd}.d.ts`. `exports` never pointed to them; `dist/items-model.d.ts` is unchanged.
- The `test:umd`, `test:cjs`, `test:esm` and `test:dist` scripts, replaced by `test:smoke`.

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
