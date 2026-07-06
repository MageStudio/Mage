/* global require, __dirname, process */
//
// Real-physics integration harness for compound child colliders.
//
// The jest suite mocks Ammo, so it can prove the message/childMap *logic* but not
// actual collision *response*. This harness loads the real vendored Ammo build
// (dist/ammo.js) and drives the actual worker code (addCompound, stepSimulation,
// calculateCollisions) to prove the fix end-to-end:
//
//   1. A sphere moving toward a wall that is a *child* of a compound floor is
//      stopped by the wall (before the fix the child had no collider).
//   2. Rotating the compound root carries the wall collider with it — a sphere
//      fired along the rotated axis is still stopped.
//   3. Control: with the wall removed, the sphere passes straight through.
//
// Run with:  node scripts/verify-compound-colliders.js
// (Ammo is required natively *before* the script enables @babel/register, so
//  babel's strict-mode transform never touches the emscripten UMD. Do NOT run
//  with `node -r @babel/register` — that would transform Ammo and break it.)

const path = require("path");

// Globals the worker modules expect (they run in a WebWorker at runtime).
global.self = global;
const dispatched = [];
global.postMessage = msg => dispatched.push(msg);

const ammoFactory = require(path.resolve(__dirname, "../dist/ammo.js"));

// Register babel only for our src (never for dist/ammo.js or node_modules).
require("@babel/register")({
    ignore: [/node_modules/, /dist[\\/]ammo\.js$/],
});

const world = require("../src/physics/worker/world").default;
const { addCompound, addSphere, setLinearVelocity } = require("../src/physics/worker/elements");
const { PHYSICS_EVENTS } = require("../src/physics/messages");
const { COLLIDER_TYPES } = require("../src/physics/constants");

const IDENTITY_Q = { x: 0, y: 0, z: 0, w: 1 };
const DT = 1 / 60;
const STEPS = 150;

const readPosition = uuid => {
    const el = world.getElement(uuid);
    const tr = new global.Ammo.btTransform();
    el.body.getMotionState().getWorldTransform(tr);
    const o = tr.getOrigin();
    const pos = { x: o.x(), y: o.y(), z: o.z() };
    global.Ammo.destroy(tr);
    return pos;
};

const wallCollisions = () =>
    dispatched.filter(
        m =>
            m.event === PHYSICS_EVENTS.DISPATCH &&
            m.eventName === PHYSICS_EVENTS.ELEMENT.COLLISION &&
            m.uuid === "wall",
    ).length;

// Reset the physics world between scenarios (fresh dynamics world + captured msgs).
const resetWorld = () => {
    dispatched.length = 0;
    world.elements = {};
    world.initialised = false;
    world.init({ gravity: { x: 0, y: -30, z: 0 }, fixedTimeStep: 1 / 120, maxSubSteps: 5 });
};

// Floor (10 x 1 x 10) centered at origin, top at y = 0.5. Optional wall child
// (1 x 4 x 10) resting on the floor at local +x. `floorQuat` bakes in a rotation
// of the whole compound (to test that the child collider rotates with the root).
const buildFloor = ({ floorQuat = IDENTITY_Q, withWall = true }) => {
    const shapes = [
        {
            childUuid: "floor",
            colliderType: COLLIDER_TYPES.BOX,
            width: 10,
            height: 1,
            length: 10,
            localPosition: { x: 0, y: 0, z: 0 },
            localQuaternion: IDENTITY_Q,
        },
    ];
    if (withWall) {
        shapes.push({
            childUuid: "wall",
            colliderType: COLLIDER_TYPES.BOX,
            width: 1,
            height: 4,
            length: 10,
            localPosition: { x: 4, y: 2.5, z: 0 },
            localQuaternion: IDENTITY_Q,
        });
    }
    addCompound({
        uuid: "floor",
        position: { x: 0, y: 0, z: 0 },
        quaternion: floorQuat,
        mass: 0,
        kinematic: true,
        friction: 1,
        shapes,
    });
};

const addRollingSphere = (start, velocity) => {
    addSphere({
        uuid: "sphere",
        radius: 0.5,
        position: start,
        quaternion: IDENTITY_Q,
        mass: 1,
        friction: 0.4,
    });
    setLinearVelocity({ uuid: "sphere", velocity });
};

const run = () => {
    for (let i = 0; i < STEPS; i++) {
        world.stepSimulation(DT);
        world.calculateCollisions();
    }
    return readPosition("sphere");
};

const results = [];
const check = (name, pass, detail) => {
    results.push({ name, pass });
    console.log(`${pass ? "PASS" : "FAIL"}  ${name}  — ${detail}`);
};

ammoFactory().then(A => {
    global.Ammo = A;

    // ── Scenario 1: wall child blocks the sphere ────────────────────────────
    resetWorld();
    buildFloor({ withWall: true });
    addRollingSphere({ x: 0, y: 1.1, z: 0 }, { x: 12, y: 0, z: 0 });
    let pos = run();
    // Wall inner face at x = 3.5, sphere radius 0.5 → blocked near x = 3.0.
    check(
        "wall child stops sphere",
        pos.x < 3.5 && wallCollisions() > 0,
        `sphere.x=${pos.x.toFixed(2)} (expect <3.5), wallCollisions=${wallCollisions()}`,
    );

    // ── Scenario 2: rotate compound 90° about Y → wall now blocks along -z ───
    resetWorld();
    buildFloor({ withWall: true, floorQuat: { x: 0, y: Math.SQRT1_2, z: 0, w: Math.SQRT1_2 } });
    addRollingSphere({ x: 0, y: 1.1, z: 0 }, { x: 0, y: 0, z: -12 });
    pos = run();
    // Wall now centered at world z = -4, inner face z = -3.5 → blocked near z = -3.0.
    check(
        "rotated compound carries wall collider",
        pos.z > -3.5 && wallCollisions() > 0,
        `sphere.z=${pos.z.toFixed(2)} (expect >-3.5), wallCollisions=${wallCollisions()}`,
    );

    // ── Control: no wall → sphere passes straight through the wall's location ─
    resetWorld();
    buildFloor({ withWall: false });
    addRollingSphere({ x: 0, y: 1.1, z: 0 }, { x: 12, y: 0, z: 0 });
    pos = run();
    check(
        "control (no wall) lets sphere pass",
        pos.x > 3.5 && wallCollisions() === 0,
        `sphere.x=${pos.x.toFixed(2)} (expect >3.5), wallCollisions=${wallCollisions()}`,
    );

    const failed = results.filter(r => !r.pass);
    console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
    process.exit(failed.length ? 1 : 0);
});
