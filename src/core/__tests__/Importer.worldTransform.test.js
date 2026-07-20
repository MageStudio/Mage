// Regression test for the child-scale/position import bug.
//
// completeCommonCreationSteps applies the saved LOCAL transform (position /
// rotation / quaternion / scale) and, historically, ALWAYS applied the saved
// WORLD transform on top. Writing world-space position/quaternion into an
// element's LOCAL slot is only correct for ROOT elements. For an element that
// will be parented (parentUUID set), parent.add() reproduces the world
// transform from the LOCAL values — so applying the world transform here would
// re-apply the parent's transform on reload, mis-placing and (under a scaled
// parent) mis-scaling the child.
//
// So: setWorldTransform must be called for roots, and skipped for elements
// carrying a parentUUID.

jest.mock("whatwg-fetch", () => ({ fetch: jest.fn() }));
// between.js (pulled in transitively via lib/easing) touches
// requestAnimationFrame at import time, which the node test env lacks.
jest.mock("../../lib/easing", () => ({ tweenTo: jest.fn(() => Promise.resolve()) }));

import { Importer } from "../Importer";

const makeFakeElement = () => ({
    calls: { setWorldTransform: 0, setScale: 0, setPosition: 0 },
    setPosition() {
        this.calls.setPosition++;
    },
    setRotation() {},
    setQuaternion() {},
    setScale() {
        this.calls.setScale++;
    },
    setOpacity() {},
    setUuid() {},
    setName() {},
    setWorldTransform() {
        this.calls.setWorldTransform++;
    },
    addScript() {},
    setData() {},
    addTags() {},
});

const baseData = overrides => ({
    position: { x: 1, y: 2, z: 3 },
    rotation: { x: 0, y: 0, z: 0 },
    quaternion: { x: 0, y: 0, z: 0, w: 1 },
    scale: { x: 2, y: 2, z: 2 },
    opacity: 1,
    uuid: "child-uuid",
    name: "child",
    data: {},
    worldTransform: {
        position: { x: 10, y: 0, z: 0 },
        quaternion: { x: 0, y: 0, z: 0, w: 1 },
    },
    ...overrides,
});

describe("Importer.completeCommonCreationSteps – world transform application", () => {
    test("applies the saved world transform for a ROOT element (no parentUUID)", () => {
        const element = makeFakeElement();
        Importer.completeCommonCreationSteps(element, baseData());

        expect(element.calls.setScale).toBe(1);
        expect(element.calls.setWorldTransform).toBe(1);
    });

    test("does NOT apply the world transform for a PARENTED element (parentUUID set)", () => {
        const element = makeFakeElement();
        Importer.completeCommonCreationSteps(element, baseData({ parentUUID: "holder-uuid" }));

        // Local scale/position are still applied — those are what parent.add()
        // uses to reproduce the correct world transform.
        expect(element.calls.setScale).toBe(1);
        expect(element.calls.setPosition).toBe(1);
        // ...but the world transform must NOT clobber the local slot.
        expect(element.calls.setWorldTransform).toBe(0);
    });

    test("honours an explicit skipWorldTransform option for roots too", () => {
        const element = makeFakeElement();
        Importer.completeCommonCreationSteps(element, baseData(), { skipWorldTransform: true });

        expect(element.calls.setWorldTransform).toBe(0);
    });
});
