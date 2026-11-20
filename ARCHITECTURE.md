# Architecture

## Bird's-eye view

`mage-engine` is a game engine library layered over THREE.js. A game is a set of `Level` classes
registered with a `Router` under URL-hash routes. When the route changes, the `GameRunner`
creates the matching level, waits for physics to be ready, populates the THREE scene (from level
data) and runs a per-frame render loop. Rigid-body physics lives in a web
worker running Ammo.js; the main thread and worker talk only through messages.

Everything public is re-exported from a single entry, `src/index.js`, and bundled by rollup into
a single ES module.

## Code map

- `src/index.js`: package entry. Re-exports entities, lights, audio, fx, controls, physics,
  UI helpers and a few third-party namespaces (`THREE`, `rxjs`, `xstate`, inferno).
- `src/core/Scene.js`: THREE scene, renderer and element list. `src/core/Level.js`: base class
  for levels and the frame loop. Also in `src/core/`: `config.js`, `Instancing.js` (opt-in
  InstancedMesh batching of repeated model meshes), `universe.js` (uuid to element
  lookup), `Assets.js`, `Importer.js` and `Exporter.js` (level data in and out), `Stats.js`,
  `window.js`, and `src/core/input/` (keyboard, mouse, gamepad).
- `src/entities/Entity.js` and `src/entities/Element.js`: base classes. Also `src/entities/camera.js`,
  `src/entities/base/` (Box, Sphere, Plane, Sprite, Label and other primitives) and
  `src/entities/animations/`.
- `src/physics/index.js`: main-thread physics facade. `src/physics/messages.js`: message names.
  `src/physics/constants.js`, `src/physics/utils.js`, `src/physics/hitbox.js`: collider constants
  and helpers.
- `src/physics/worker/index.js`: message switch running inside the worker. Also
  `src/physics/worker/world.js`, `elements.js`, `vehicles.js`, `player.js`, `effects.js` and
  `src/physics/worker/lib/` in the same folder.
- `src/runner/GameRunner.js` and `src/router/Router.js`: level registry, lifecycle and
  hash-based routing.
- `src/state/`: `mage.state`, the game state store. `index.js` is the `State` singleton (immutable
  `{ game, level }` tree, subscriptions, `batch`, `hydrate`, restore and autosave), `paths.js` and
  `validate.js` (path parsing, JSON-safe check and freeze), `history.js` (undo/redo of roots) and
  `saves.js` (save slots over a storage adapter, `localStorage` by default).
- `src/ui/`: inferno-based UI components, such as the loading screen and labels. `UI.isLoadingScreenVisible()` reports whether the loading screen is requested.
- `src/ui/hud/`: the public `UI` export, a DOM HUD layer (`.mage-hud` root inside
  `Config.container()`) of button, label and input widgets driven through `HudElement` handles
  (`index.js`, `HudElement.js`, `anchors.js`, `styles.js`). Built per level from
  `Config.ui(path).hud` and cleared on dispose; has an edit mode used by the editor. It also holds
  entity labels (`labels.js`): `Entity.setLabel` creates a DOM label in a `.mage-labels` layer
  (first child of `.mage-hud`) that `UI.updateLabels(camera)` projects every frame.
- `src/scripts/`: `BaseScript.js`, `StaticScript.js`, `Scripts.js` and `src/scripts/builtin/`.
- `src/lights/`, `src/materials/`, `src/models/`, `src/images/`, `src/audio/`, `src/video/`,
  `src/loaders/`, `src/controls/`: asset managers and feature modules.
- `src/fx/`: materials (water, ocean, mirror), scenery (sky, skybox), shaders, particles,
  post-processing.
- `src/lib/`: shared helpers (math, uuid, colour, easing, feature detection, URL and query).
- `src/env.js`: reads engine settings such as `MAGE_ASSETS_BASE_URL` from the host page.
- `config/index.js` and `config/rollup.main.js`: rollup configuration; the build output goes
  to the gitignored `dist/mage.js`.
- `scripts/verify-compound-colliders.js` and `scripts/verify-hull-colliders.js`: collider checks.
- `__mocks__/`, `jest.config.js`, `babel.config.js`, `eslint.config.js`: tooling.
- `dist/ammo.js`: vendored Ammo.js, loaded by the physics worker.
- `examples/`: runnable demos.

## Data and control flow

1. A host registers levels with `Router.on(route, LevelClass)`, which calls
   `GameRunner.register`.
2. A hash change (or `Router.goTo`) leads `Router` to ask `GameRunner.start(path, options)` for
   the level. Any running level is disposed first (`Level.dispose`).
3. `GameRunner` instantiates the level class, then builds the HUD with
   `UI.loadHUD(Config.ui(path).hud)` (even when `Config.ui().enabled` is false);
   `disposeCurrentLevel` calls `UI.clear()`. It waits for `Physics.waitForState(READY)`, then calls
   `prepareScene()` and `init()` on the level.
4. `Level.init` calls `Physics.init()`, which spawns the worker, posts `physics:load:ammo` and
   polls until the worker reports ready. Physics can be turned off through `Config.physics()`.
5. `GameRunner` imports level data via `Importer.importLevelSnapshot` (from `Config`), then
   calls `onStart` and resolves with the level.
6. Each frame, `Level.render` (scheduled with `requestAnimationFrame`) runs `Instancing.update()`
   when instancing is enabled, then updates particles,
   scene, entity labels (`UI.updateLabels`), assets, stats, controls and input, then renders.
7. Entities that have colliders send `physics:add:*` messages to the worker. The worker steps
   the Ammo world and posts `physics:update` and collision messages back; `Physics` is an
   `EventDispatcher`, and `Scene` listens for `PHYSICS_EVENTS.UPDATE` to move bodies.
8. `GameRunner.pause()` sets a paused flag on `GameRunner` and the level (`Level.render` keeps
   drawing but skips updates, controls and assets), posts `physics:pause` through
   `Physics.pause()`, pauses tweens, suspends audio and input, then calls `onPause` on the level
   and `Universe`; `resume()` reverses it. `GameRunner.restart()` defers (`setTimeout 0`) a
   dispose of the current level and a `start` of the same path and options, and concurrent calls
   share one promise.
9. The state level boundary: `Router.start` calls `State._start(Config.state(null))` once, after
   `Config.setConfig` and before the first `startLevel`, which sets the history limit and runs the
   optional restore (`persist.slot`). `GameRunner.createNewLevel` calls `State._beginLevel()` right
   before `new classname(...)`, so subscriptions made from `onCreate` on belong to the level.
   `disposeCurrentLevel` runs `running.dispose()` (so `onDispose` still sees `level`), then
   `State._endLevel()` (drops the level's subscriptions), `State._resetLevel()` (`level` back to
   `{}`) and `State.history.clear()`. `game` is untouched, also across `restart()`.
10. Disposing a level calls `Physics.dispose()`, which sends `physics:terminate` and moves the
   state to TERMINATING.

## Boundaries and invariants

- The main thread never touches Ammo directly. All physics traffic goes through the message
  names in `src/physics/messages.js`; a new message must be handled in
  `src/physics/worker/index.js`.
- Worker code is imported with the `worker:` prefix (`worker:./worker`), resolved by rollup's
  web-worker loader. Jest maps it to `__mocks__/workerStub.js`.
- `src/index.js` is the public surface. Removing or renaming an export is a breaking change.
- `Scene.add` avoids duplicate entries per element and per body uuid; keep that when changing
  how elements are registered.
- `Universe` keys elements by body uuid; `Scene.add` and `Scene.remove` keep it in sync.
- Only one level runs at a time (`GameRunner.running`).
- `src/state/saves.js` reaches `GameRunner` only at call time, because `state/index` and
  `GameRunner` import each other; keep it that way and don't read `State` at module top level.
- The bundle is a build artefact and is gitignored; `dist/ammo.js` is tracked.

## Cross-repo context

The Mage Studio editor consumes this package. It uses the exports of `src/index.js`, including
helpers such as `ConvexGeometry` and the line classes for drawing collider shapes, and it
imports and exports level data through `Importer` and `Exporter`. Changes to the exported API or
to the level data format therefore affect the editor and games built with the engine. The
documentation site describes the public API.
