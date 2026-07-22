import { Object3D, Mesh, BoxGeometry } from "three";
import { PHYSICS_EVENTS } from "../messages";
import { COLLIDER_TYPES } from "../constants";

// index.js pulls in the bundler-only `worker:./worker` module and Config; stub
// both so the Physics singleton is importable and "physics enabled" under jest.
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
        mapColliderTypeToDescription: () => () => ({
            width: 1,
            height: 1,
            length: 1,
            radius: 0.5,
        }),
    };
});

import Physics from "../index";

// Fake element exposing the surface refreshOwningBody/realizeSubtree use,
// including the parent chain topmostPhysicsRoot walks.
const makeElement = (id, options, body, children = [], physicsEnabled = true) => {
    const el = {
        children,
        isPhysicsEnabled: () => physicsEnabled,
        uuid: () => id,
        getPhysicsOptions: key => (key ? options[key] : options),
        getBody: () => body,
        getParent: () => el._parent || null,
    };
    children.forEach(child => {
        child._parent = el;
    });
    return el;
};

const near = (actual, expected, eps = 1e-3) => Math.abs(actual - expected) < eps;

// A holder root with one slat child, realized as a compound.
const makeRealizedCompound = () => {
    const rootBody = new Mesh(new BoxGeometry(10, 1, 10));
    const slatBody = new Mesh(new BoxGeometry(2, 0.2, 1));
    slatBody.position.set(0, 1, 0);
    rootBody.add(slatBody);
    rootBody.updateMatrixWorld(true);

    const slat = makeElement("slat", { colliderType: COLLIDER_TYPES.BOX }, slatBody);
    const root = makeElement("platform", { colliderType: COLLIDER_TYPES.BOX }, rootBody, [slat]);

    Physics.realizeSubtree(root);
    return { root, rootBody, slat, slatBody };
};

beforeEach(() => {
    jest.useFakeTimers();
    Physics.elements = [];
    Physics.pendingRefreshRoots = new Map();
    Physics.refreshTimer = null;
    Physics.worker = { postMessage: jest.fn() };
});

afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
});

describe("Physics.refreshOwningBody", () => {
    it("rebuilds the owning compound after a child is rescaled", () => {
        const { slat, slatBody } = makeRealizedCompound();
        expect(Physics.worker.postMessage).toHaveBeenCalledTimes(1);

        // Shrink the slat to half length; the baked compound shape is now stale.
        slatBody.scale.set(1, 1, 0.5);
        slatBody.updateWorldMatrix(true, true);
        Physics.refreshOwningBody(slat);
        jest.runAllTimers();

        const calls = Physics.worker.postMessage.mock.calls.map(c => c[0]);
        // Old body torn down, new compound realized in its place.
        expect(calls[1]).toEqual({ event: PHYSICS_EVENTS.ELEMENT.DISPOSE, uuid: "platform" });
        expect(calls[2].event).toBe(PHYSICS_EVENTS.ADD.COMPOUND);
        const slatShape = calls[2].shapes.find(s => s.childUuid === "slat");
        expect(near(slatShape.length, 0.5)).toBe(true);
        expect(Physics.elements).toContain("platform");
    });

    it("debounces multiple changes into a single rebuild", () => {
        const { slat, slatBody, root, rootBody } = makeRealizedCompound();

        slatBody.scale.set(2, 1, 1);
        slatBody.position.set(1, 1, 0);
        rootBody.updateMatrixWorld(true);
        Physics.refreshOwningBody(slat);
        Physics.refreshOwningBody(slat);
        Physics.refreshOwningBody(root);
        jest.runAllTimers();

        const calls = Physics.worker.postMessage.mock.calls.map(c => c[0]);
        // initial ADD + exactly one DISPOSE + one re-ADD.
        expect(calls).toHaveLength(3);
        const rebuilt = calls[2];
        const slatShape = rebuilt.shapes.find(s => s.childUuid === "slat");
        expect(near(slatShape.width, 4)).toBe(true); // 2 (geometry) * 2 (scale)
        expect(near(slatShape.localPosition.x, 1)).toBe(true);
    });

    it("rebuilds a standalone single body on rescale", () => {
        const body = new Mesh(new BoxGeometry(1, 1, 1));
        const lonely = makeElement("lonely", { colliderType: COLLIDER_TYPES.BOX }, body);
        Physics.add(lonely, lonely.getPhysicsOptions());
        expect(Physics.elements).toContain("lonely");
        Physics.worker.postMessage.mockClear();

        body.scale.set(3, 1, 1);
        body.updateWorldMatrix(true, true);
        Physics.refreshOwningBody(lonely);
        jest.runAllTimers();

        const calls = Physics.worker.postMessage.mock.calls.map(c => c[0]);
        expect(calls[0]).toEqual({ event: PHYSICS_EVENTS.ELEMENT.DISPOSE, uuid: "lonely" });
        // Re-added through the single-body path (realizeSubtree → add).
        expect(calls).toHaveLength(2);
        expect(calls[1].uuid).toBe("lonely");
        expect(Physics.elements).toContain("lonely");
    });

    it("is a no-op for elements outside any realized physics body", () => {
        const plain = makeElement("decor", {}, new Object3D(), [], false);
        Physics.refreshOwningBody(plain);
        jest.runAllTimers();
        expect(Physics.worker.postMessage).not.toHaveBeenCalled();
    });
});
