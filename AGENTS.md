# AGENTS.md

## What this repo is

`mage-engine` is a WebGL JavaScript game engine built on top of THREE.js, published to npm. The
source in `src/` is bundled by rollup into a single ES module (`dist/mage.js`) that the Mage Studio
editor and games consume. Physics runs in a web worker on top of a vendored Ammo.js.

## Setup, test, lint, build

Package manager is npm.

- Setup: `npm ci`
- Test: `npm test` (jest, Node test environment)
- Lint: `npm run lint` (`eslint src`); `npm run lint:fix` applies fixes
- Build: `npm run build` (rollup, writes `dist/mage.js`)
- Collider checks: `npm run verify:physics`

CI (`.github/workflows/test.yml`) runs on Node 20: `npm ci`, `npm run lint`, `npm test`. It does
not run the build. `.nvmrc` says 14.19.3, which disagrees with CI; use Node 20 to match CI.

## Rules

- Never run `npm version` or `npm publish`. The `postversion` script pushes tags and publishes
  the package.
- Run `npm run verify:physics` when you change collider code (`scripts/verify-*-colliders.js`).
- Do not commit `dist/mage.js`, `dist/mage.node.js`, `coverage/` or `node_modules/`; they are
  gitignored.
- `dist/ammo.js` is a tracked, vendored file. Leave it alone.
- Add or update tests for behaviour you change, and run `npm test` and `npm run lint` before
  you open a pull request.
- Do not commit secrets, credentials or environment values.

## Conventions

- Source is ES modules under `src/`, transpiled by Babel (`babel.config.js`).
- Tests are `*.test.js` files in `__tests__/` folders next to the code they cover. `jest.config.js`
  only looks under `src/`. Mocks live in `__mocks__/` (`three.js`, `workerStub.js`); jest maps
  `worker:` imports to the worker stub.
- Formatting follows `.prettierrc.js`, enforced through ESLint (`eslint.config.js`). Code uses
  4-space indentation and double quotes.
- Singletons are exported as default instances (for example `Scene`, `Physics`, `GameRunner`,
  `Router`, `Config`); classes use `export class` alongside.
- Public API is whatever `src/index.js` exports. Add new public symbols there.
- Modules in `src/`: audio, controls, core, entities, fx, images, lib, lights, loaders,
  materials, models, physics (with `worker/`), router, runner, scripts, storage, store, ui,
  video, plus `env.js`.
- `examples/` holds small runnable demos, one folder each, served by `npm run dev` / `npm start`
  (http-server on port 8085).

## Where to look next

Read `ARCHITECTURE.md` for the code map, data flow and invariants.
