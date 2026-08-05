/* global require, __dirname, process */
//
// Real-physics integration harness for HULL colliders and static collision events.
//
// The jest suite mocks Ammo, so it can prove the message/shape *logic* but not
// actual collision *response*. This harness loads the real vendored Ammo build
// (dist/ammo.js) and drives the actual worker code (addCompound, addSphere,
// stepSimulation, calculateCollisions) to prove the behaviour end-to-end:
//
//   1. A dynamic sphere lands on a hull floor at the right height — proving the
//      hull is built at the right size, not empty or mis-scaled.
//   2. A dynamic HULL body rests on a static hull floor (hull-vs-hull, the pair
//      a triangle-mesh collider could never handle).
//   3. A hull that is a *child* of a compound stops a sphere, and rotating the
//      compound root carries that hull collider with it.
//   4. Two static bodies report no contacts by default, and DO report them once
//      collisionEvents is set on one of them.
//   5. Controls: no floor → the sphere falls through; so the checks above are
//      detecting a real collider rather than always passing.
//
// Run with:  node scripts/verify-hull-colliders.js
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
const STEPS = 180;

// The 8 corners of a box, centred on the origin — what extractHullPoints
// produces for a cube mesh on the main thread.
const cubePoints = (width, height, length) => {
    const [x, y, z] = [width / 2, height / 2, length / 2];
    const points = [];
    for (const sx of [-x, x]) {
        for (const sy of [-y, y]) {
            for (const sz of [-z, z]) points.push(sx, sy, sz);
        }
    }
    return points;
};

const hullShape = ({ childUuid, width, height, length, localPosition }) => ({
    childUuid,
    colliderType: COLLIDER_TYPES.MODEL_SHAPE,
    points: cubePoints(width, height, length),
    // The measured AABB still travels with a hull leaf: it sizes CCD and drives
    // the childMap region test.
    width,
    height,
    length,
    localPosition,
    localQuaternion: IDENTITY_Q,
});

const readPosition = uuid => {
    const element = world.getElement(uuid);
    const transform = new global.Ammo.btTransform();
    element.body.getMotionState().getWorldTransform(transform);
    const origin = transform.getOrigin();
    const position = { x: origin.x(), y: origin.y(), z: origin.z() };
    global.Ammo.destroy(transform);
    return position;
};

const collisionsFor = uuid =>
    dispatched.filter(
        message =>
            message.event === PHYSICS_EVENTS.DISPATCH &&
            message.eventName === PHYSICS_EVENTS.ELEMENT.COLLISION &&
            message.uuid === uuid,
    ).length;

const resetWorld = () => {
    dispatched.length = 0;
    world.elements = {};
    world.initialised = false;
    world.init({ gravity: { x: 0, y: -30, z: 0 }, fixedTimeStep: 1 / 120, maxSubSteps: 5 });
};

// Hull floor, 10 x 1 x 10 centred at the origin — top surface at y = 0.5.
const buildHullFloor = (overrides = {}) => {
    addCompound({
        uuid: "floor",
        position: { x: 0, y: 0, z: 0 },
        quaternion: IDENTITY_Q,
        mass: 0,
        friction: 1,
        shapes: [
            hullShape({
                childUuid: "floor",
                width: 10,
                height: 1,
                length: 10,
                localPosition: { x: 0, y: 0, z: 0 },
            }),
        ],
        ...overrides,
    });
};

const dropSphere = (start, velocity = { x: 0, y: 0, z: 0 }) => {
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

const run = (uuid = "sphere") => {
    for (let i = 0; i < STEPS; i++) {
        world.stepSimulation(DT);
        world.calculateCollisions();
    }
    return readPosition(uuid);
};

const results = [];
const check = (name, pass, detail) => {
    results.push({ name, pass });
    console.log(`${pass ? "PASS" : "FAIL"}  ${name}  — ${detail}`);
};

ammoFactory().then(A => {
    global.Ammo = A;

    // ── 1: a hull floor actually stops a dynamic sphere, at the right height ──
    resetWorld();
    buildHullFloor();
    dropSphere({ x: 0, y: 6, z: 0 });
    let position = run();
    // Floor top at y = 0.5, sphere radius 0.5 → resting centre near y = 1.0.
    check(
        "hull floor stops a dynamic sphere at the correct height",
        Math.abs(position.y - 1.0) < 0.15,
        `sphere.y=${position.y.toFixed(3)} (expect ~1.0)`,
    );

    // ── Control: no floor → the sphere falls, so check 1 means something ──────
    resetWorld();
    dropSphere({ x: 0, y: 6, z: 0 });
    position = run();
    check(
        "control (no floor) lets the sphere fall",
        position.y < -10,
        `sphere.y=${position.y.toFixed(2)} (expect <-10)`,
    );

    // ── 2: hull vs hull — the pair a triangle mesh could never do ─────────────
    resetWorld();
    buildHullFloor();
    addCompound({
        uuid: "crate",
        position: { x: 0, y: 6, z: 0 },
        quaternion: IDENTITY_Q,
        mass: 1,
        friction: 0.5,
        ccdRadius: 0.5,
        shapes: [
            hullShape({
                childUuid: "crate",
                width: 1,
                height: 1,
                length: 1,
                localPosition: { x: 0, y: 0, z: 0 },
            }),
        ],
    });
    position = run("crate");
    // Floor top 0.5 + half the crate 0.5 → resting centre near y = 1.0.
    check(
        "dynamic hull rests on a static hull",
        Math.abs(position.y - 1.0) < 0.2,
        `crate.y=${position.y.toFixed(3)} (expect ~1.0)`,
    );

    // ── 3: a hull welded as a compound child blocks a sphere ─────────────────
    const buildFloorWithHullWall = floorQuat =>
        addCompound({
            uuid: "floor",
            position: { x: 0, y: 0, z: 0 },
            quaternion: floorQuat,
            mass: 0,
            kinematic: true,
            friction: 1,
            shapes: [
                hullShape({
                    childUuid: "floor",
                    width: 10,
                    height: 1,
                    length: 10,
                    localPosition: { x: 0, y: 0, z: 0 },
                }),
                hullShape({
                    childUuid: "wall",
                    width: 1,
                    height: 4,
                    length: 10,
                    localPosition: { x: 4, y: 2.5, z: 0 },
                }),
            ],
        });

    resetWorld();
    buildFloorWithHullWall(IDENTITY_Q);
    dropSphere({ x: 0, y: 1.1, z: 0 }, { x: 12, y: 0, z: 0 });
    position = run();
    // Wall inner face at x = 3.5, sphere radius 0.5 → blocked near x = 3.0.
    check(
        "hull child of a compound stops a sphere",
        position.x < 3.5 && collisionsFor("wall") > 0,
        `sphere.x=${position.x.toFixed(2)} (expect <3.5), wallCollisions=${collisionsFor("wall")}`,
    );

    // ── 3b: rotating the root carries the hull child with it ─────────────────
    resetWorld();
    buildFloorWithHullWall({ x: 0, y: Math.SQRT1_2, z: 0, w: Math.SQRT1_2 });
    dropSphere({ x: 0, y: 1.1, z: 0 }, { x: 0, y: 0, z: -12 });
    position = run();
    check(
        "rotated compound carries its hull child collider",
        position.z > -3.5 && collisionsFor("wall") > 0,
        `sphere.z=${position.z.toFixed(2)} (expect >-3.5), wallCollisions=${collisionsFor("wall")}`,
    );

    // ── 4: static vs static — the collisionEvents opt-in ─────────────────────
    // Two overlapping mass-0 hulls. Bullet drops the pair by default because
    // both sit in the STATIC filter group.
    const buildOverlappingStatics = collisionEvents => {
        buildHullFloor();
        addCompound({
            uuid: "prop",
            position: { x: 0, y: 0.5, z: 0 }, // overlaps the floor slab
            quaternion: IDENTITY_Q,
            mass: 0,
            friction: 1,
            collisionEvents,
            shapes: [
                hullShape({
                    childUuid: "prop",
                    width: 2,
                    height: 2,
                    length: 2,
                    localPosition: { x: 0, y: 0, z: 0 },
                }),
            ],
        });
    };

    resetWorld();
    buildOverlappingStatics(false);
    run("prop");
    check(
        "two static hulls report no contacts by default",
        collisionsFor("prop") === 0,
        `propCollisions=${collisionsFor("prop")} (expect 0)`,
    );

    resetWorld();
    buildOverlappingStatics(true);
    run("prop");
    check(
        "collisionEvents makes a static pair report contacts",
        collisionsFor("prop") > 0,
        `propCollisions=${collisionsFor("prop")} (expect >0)`,
    );

    const failed = results.filter(result => !result.pass);
    console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
    process.exit(failed.length ? 1 : 0);
});
