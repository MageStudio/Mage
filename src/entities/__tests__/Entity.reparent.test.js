// Regression tests for Entity.reparent().
//
// Reparenting must preserve the entity's WORLD transform: dragging an element
// under/out of/between parents in the editor should not make it jump on screen.
// These use the REAL `three` (not the lightweight mock) so attach()/matrixWorld
// math is genuinely exercised — that math is the whole point of the fix.
jest.mock("three", () => jest.requireActual("three"));
jest.mock("xstate", () => ({
    createMachine: jest.fn(),
    interpret: jest.fn(() => ({
        start: jest.fn(),
        stop: jest.fn(),
        send: jest.fn(),
        onTransition: jest.fn(),
    })),
}));
jest.mock("../../scripts/Scripts", () => ({ get: jest.fn() }));
jest.mock("../../core/Scene", () => ({ getScene: jest.fn() }));
jest.mock("../../core/universe", () => ({
    getByTag: jest.fn(() => []),
    set: jest.fn(),
    remove: jest.fn(),
    getByUUID: jest.fn(),
}));
jest.mock("../../lib/easing", () => ({ tweenTo: jest.fn(() => Promise.resolve()) }));
jest.mock("../../lib/meshUtils", () => ({
    isScene: jest.fn(() => false),
    serializeQuaternion: jest.fn(q => q && { x: q.x, y: q.y, z: q.z, w: q.w }),
    serializeVector: jest.fn(v => v && { x: v.x, y: v.y, z: v.z }),
}));

import * as THREE from "three";
import Entity from "../Entity";
import Scene from "../../core/Scene";

const round = n => Math.round(n * 1e4) / 1e4;

const worldPos = entity => {
    const body = entity.getBody();
    body.updateWorldMatrix(true, false);
    const v = new THREE.Vector3();
    body.getWorldPosition(v);
    return { x: round(v.x), y: round(v.y), z: round(v.z) };
};

const localPos = entity => {
    const { x, y, z } = entity.getBody().position;
    return { x: round(x), y: round(y), z: round(z) };
};

const makeEntity = (x, y, z) => {
    const e = new Entity();
    const body = new THREE.Object3D();
    body.position.set(x, y, z);
    e.setBody({ body });
    return e;
};

// Helper: attach `child` under `parent` keeping the engine's Entity bookkeeping
// in sync with the THREE body tree.
const attachAsChild = (sceneRoot, parent, child) => {
    parent.getBody().add(child.getBody());
    parent.children.push(child);
    child.setParent(parent);
    sceneRoot.updateMatrixWorld(true);
};

describe("Entity.reparent – world transform preservation", () => {
    let sceneRoot;

    beforeEach(() => {
        jest.clearAllMocks();
        sceneRoot = new THREE.Scene();
        Scene.getScene.mockReturnValue(sceneRoot);
    });

    test("moving a child OUT to the scene root keeps its world position", () => {
        const parent = makeEntity(5, 5, 5);
        sceneRoot.add(parent.getBody());
        const child = makeEntity(5, 5, 5); // local (5,5,5) under parent → world (10,10,10)
        attachAsChild(sceneRoot, parent, child);
        expect(worldPos(child)).toEqual({ x: 10, y: 10, z: 10 });

        child.reparent(null);
        sceneRoot.updateMatrixWorld(true);

        // World position preserved. (Before the fix this regressed to (5,5,5),
        // i.e. the stale local offset was kept as the new world position.)
        expect(worldPos(child)).toEqual({ x: 10, y: 10, z: 10 });
    });

    test("moving a root child INTO a parent keeps its world position", () => {
        const parent = makeEntity(5, 5, 5);
        sceneRoot.add(parent.getBody());
        const child = makeEntity(10, 10, 10); // world (10,10,10) at root
        sceneRoot.add(child.getBody());
        sceneRoot.updateMatrixWorld(true);

        child.reparent(parent);
        sceneRoot.updateMatrixWorld(true);

        expect(worldPos(child)).toEqual({ x: 10, y: 10, z: 10 });
        // The inspector now shows the local offset from the parent.
        expect(localPos(child)).toEqual({ x: 5, y: 5, z: 5 });
    });

    test("moving a child BETWEEN two parents keeps its world position", () => {
        const parentA = makeEntity(5, 5, 5);
        const parentB = makeEntity(100, 0, 0);
        sceneRoot.add(parentA.getBody());
        sceneRoot.add(parentB.getBody());
        const child = makeEntity(5, 5, 5); // local under A → world (10,10,10)
        attachAsChild(sceneRoot, parentA, child);
        expect(worldPos(child)).toEqual({ x: 10, y: 10, z: 10 });

        child.reparent(parentB);
        sceneRoot.updateMatrixWorld(true);

        expect(worldPos(child)).toEqual({ x: 10, y: 10, z: 10 });
        expect(localPos(child)).toEqual({ x: -90, y: 10, z: 10 });
    });

    test("keeps Entity children arrays and parent pointers in sync", () => {
        const parent = makeEntity(0, 0, 0);
        sceneRoot.add(parent.getBody());
        const child = makeEntity(1, 2, 3);
        sceneRoot.add(child.getBody());

        child.reparent(parent);
        expect(parent.children).toContain(child);
        expect(child.getParent()).toBe(parent);

        child.reparent(null);
        expect(parent.children).not.toContain(child);
        expect(child.getParent()).toBe(false);
    });
});
