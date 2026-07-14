import { Object3D } from "three";
import { PHYSICS_EVENTS } from "../messages";
import { COLLIDER_TYPES } from "../constants";

// Same stubs as realizeSubtree.test.js: index.js pulls in the bundler-only
// worker module and Config; utils' collider description needs real geometry.
jest.mock("worker:./worker", () => ({ __esModule: true, default: class {} }), { virtual: true });
jest.mock("../../core/config", () => ({
    __esModule: true,
    default: { physics: () => ({ enabled: true }) },
}));
jest.mock("../utils", () => {
    const actual = jest.requireActual("../utils");
    return {
        __esModule: true,
        ...actual,
        mapColliderTypeToDescription: () => () => ({ width: 1, height: 1, length: 1, radius: 0.5 }),
    };
});

import Physics from "../index";

const BOX = { colliderType: COLLIDER_TYPES.BOX };

// Fake element with a mutable parent link + children so we can simulate reparents.
const makeEl = (id, physicsEnabled, options, body) => {
    const el = {
        children: [],
        _parent: null,
        isPhysicsEnabled: () => physicsEnabled,
        uuid: () => id,
        getPhysicsOptions: key => (key ? options[key] : options),
        getBody: () => body,
        getParent: () => el._parent,
    };
    return el;
};
const link = (parent, child) => {
    parent.children.push(child);
    child._parent = parent;
    parent.getBody().add(child.getBody());
    parent.getBody().updateMatrixWorld(true);
};
const unlink = (parent, child, newBodyParent) => {
    parent.children = parent.children.filter(c => c !== child);
    child._parent = null;
    newBodyParent.add(child.getBody()); // preserves nothing fancy; just keeps a valid world matrix
    newBodyParent.updateMatrixWorld(true);
};

// Convenience: pull the events emitted to the worker since the last reset.
const emitted = () => Physics.worker.postMessage.mock.calls.map(c => c[0]);
const eventsFor = uuid => emitted().filter(m => m.uuid === uuid);

beforeEach(() => {
    Physics.elements = [];
    Physics.worker = { postMessage: jest.fn() };
});

describe("Physics.rebuildAfterReparent", () => {
    it("splits a compound when a child leaves to the scene root", () => {
        const scene = new Object3D();
        const floorBody = new Object3D();
        scene.add(floorBody);
        const wallBody = new Object3D();
        wallBody.position.set(4, 2.5, 0);

        const floor = makeEl("floor", true, BOX, floorBody);
        const wall = makeEl("wall", true, BOX, wallBody);
        link(floor, wall);

        Physics.realizeSubtree(floor);
        expect(Physics.elements).toEqual(["floor"]);
        expect(eventsFor("floor")[0].event).toBe(PHYSICS_EVENTS.ADD.COMPOUND);

        // Wall leaves the floor for the scene root.
        Physics.worker.postMessage.mockClear();
        unlink(floor, wall, scene);
        Physics.rebuildAfterReparent(wall, floor);

        const floorEvents = eventsFor("floor").map(m => m.event);
        // Old compound torn down, floor rebuilt as a lone box (no physics children).
        expect(floorEvents).toContain(PHYSICS_EVENTS.ELEMENT.DISPOSE);
        expect(floorEvents).toContain(PHYSICS_EVENTS.ADD.BOX);
        // Wall becomes its own body.
        expect(eventsFor("wall").map(m => m.event)).toContain(PHYSICS_EVENTS.ADD.BOX);
        expect(Physics.elements.sort()).toEqual(["floor", "wall"]);
    });

    it("moves a child's collider from one compound root to another", () => {
        const scene = new Object3D();
        const floorABody = new Object3D();
        floorABody.position.set(-10, 0, 0);
        const floorBBody = new Object3D();
        floorBBody.position.set(10, 0, 0);
        scene.add(floorABody, floorBBody);
        const wallBody = new Object3D();
        wallBody.position.set(1, 2.5, 0);

        const floorA = makeEl("floorA", true, BOX, floorABody);
        const floorB = makeEl("floorB", true, BOX, floorBBody);
        const wall = makeEl("wall", true, BOX, wallBody);
        link(floorA, wall);

        Physics.realizeSubtree(floorA); // compound floorA + wall
        Physics.realizeSubtree(floorB); // lone floorB box
        expect(Physics.elements.sort()).toEqual(["floorA", "floorB"]);

        // Wall moves from floorA to floorB.
        Physics.worker.postMessage.mockClear();
        unlink(floorA, wall, scene);
        link(floorB, wall);
        Physics.rebuildAfterReparent(wall, floorA);

        // Both roots torn down and rebuilt: A loses the wall, B gains it.
        expect(eventsFor("floorA").map(m => m.event)).toEqual(
            expect.arrayContaining([PHYSICS_EVENTS.ELEMENT.DISPOSE, PHYSICS_EVENTS.ADD.BOX]),
        );
        expect(eventsFor("floorB").map(m => m.event)).toEqual(
            expect.arrayContaining([PHYSICS_EVENTS.ELEMENT.DISPOSE, PHYSICS_EVENTS.ADD.COMPOUND]),
        );
        // floorB's rebuilt compound now contains the wall.
        const floorBCompound = eventsFor("floorB").find(
            m => m.event === PHYSICS_EVENTS.ADD.COMPOUND,
        );
        expect(floorBCompound.shapes.map(s => s.childUuid).sort()).toEqual(["floorB", "wall"]);
        expect(Physics.elements.sort()).toEqual(["floorA", "floorB"]);
    });

    it("is a no-op before physics is realized (e.g. during import)", () => {
        const floorBody = new Object3D();
        const wallBody = new Object3D();
        const floor = makeEl("floor", true, BOX, floorBody);
        const wall = makeEl("wall", true, BOX, wallBody);
        link(floor, wall);

        // Nothing realized yet.
        Physics.rebuildAfterReparent(wall, floor);

        expect(Physics.worker.postMessage).not.toHaveBeenCalled();
        expect(Physics.elements).toEqual([]);
    });
});
