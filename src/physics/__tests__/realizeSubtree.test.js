import { Object3D } from "three";
import { PHYSICS_EVENTS } from "../messages";
import { COLLIDER_TYPES } from "../constants";

// index.js pulls in the bundler-only `worker:./worker` module and Config; stub
// both so the Physics singleton is importable and "physics enabled" under jest.
jest.mock("worker:./worker", () => ({ __esModule: true, default: class {} }), { virtual: true });
jest.mock("../../core/config", () => ({
    __esModule: true,
    default: { physics: () => ({ enabled: true }) },
}));
// Keep utils real except the collider description, which would otherwise need
// real geometry — we drive sizes via explicit collider* options instead.
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

// Fake element exposing just the surface realizeSubtree/buildCompoundShape use.
const makeElement = (id, options, body, children = []) => ({
    children,
    isPhysicsEnabled: () => true,
    uuid: () => id,
    getPhysicsOptions: key => (key ? options[key] : options),
    getBody: () => body,
});

const near = (actual, expected, eps = 1e-6) => Math.abs(actual - expected) < eps;

beforeEach(() => {
    Physics.elements = [];
    Physics.worker = { postMessage: jest.fn() };
});

describe("Physics.realizeSubtree", () => {
    it("emits ADD.COMPOUND with children expressed in the root's local frame", () => {
        // Root body at world (1,0,2); child body parented at local (4,2.5,0).
        const rootBody = new Object3D();
        rootBody.position.set(1, 0, 2);
        const childBody = new Object3D();
        childBody.position.set(4, 2.5, 0);
        rootBody.add(childBody);
        rootBody.updateMatrixWorld(true);

        const child = makeElement(
            "wall",
            {
                colliderType: COLLIDER_TYPES.BOX,
                colliderWidth: 1,
                colliderHeight: 4,
                colliderLength: 10,
            },
            childBody,
        );
        const root = makeElement(
            "floor",
            {
                colliderType: COLLIDER_TYPES.BOX,
                colliderWidth: 10,
                colliderHeight: 1,
                colliderLength: 10,
                mass: 0,
                kinematic: true,
            },
            rootBody,
            [child],
        );

        Physics.realizeSubtree(root);

        expect(Physics.worker.postMessage).toHaveBeenCalledTimes(1);
        const msg = Physics.worker.postMessage.mock.calls[0][0];
        expect(msg.event).toBe(PHYSICS_EVENTS.ADD.COMPOUND);
        expect(msg.uuid).toBe("floor");
        expect(msg.kinematic).toBe(true);

        // Compound body sits at the root's world position.
        expect(near(msg.position.x, 1) && near(msg.position.z, 2)).toBe(true);

        // shapes[0] is the root at local identity; shapes[1] is the child at its
        // parent-relative offset (4, 2.5, 0), NOT its world position (5, 2.5, 2).
        expect(msg.shapes).toHaveLength(2);
        expect(msg.shapes[0].childUuid).toBe("floor");
        expect(msg.shapes[0].localPosition).toEqual({ x: 0, y: 0, z: 0 });

        const wall = msg.shapes[1];
        expect(wall.childUuid).toBe("wall");
        expect(near(wall.localPosition.x, 4)).toBe(true);
        expect(near(wall.localPosition.y, 2.5)).toBe(true);
        expect(near(wall.localPosition.z, 0)).toBe(true);
        // explicit collider* overrides win over the (mocked) description size
        expect(wall.width).toBe(1);
        expect(wall.height).toBe(4);
        expect(wall.length).toBe(10);
    });

    it("keeps a child's offset in the root frame when the root is rotated", () => {
        // Root rotated 90° about Y at the origin; child at local +x (4,0,0).
        const rootBody = new Object3D();
        rootBody.rotation.set(0, Math.PI / 2, 0);
        const childBody = new Object3D();
        childBody.position.set(4, 0, 0);
        rootBody.add(childBody);
        rootBody.updateMatrixWorld(true);

        // Sanity: the child's WORLD position is rotated to roughly (0,0,-4)...
        const worldChild = childBody.getWorldPosition(new Object3D().position);
        expect(near(worldChild.z, -4, 1e-4)).toBe(true);

        const child = makeElement("wall", { colliderType: COLLIDER_TYPES.BOX }, childBody);
        const root = makeElement("floor", { colliderType: COLLIDER_TYPES.BOX }, rootBody, [child]);

        Physics.realizeSubtree(root);

        const msg = Physics.worker.postMessage.mock.calls[0][0];
        // ...but expressed in the root's local frame it is back to (4,0,0).
        const wall = msg.shapes[1];
        expect(near(wall.localPosition.x, 4, 1e-4)).toBe(true);
        expect(near(wall.localPosition.y, 0, 1e-4)).toBe(true);
        expect(near(wall.localPosition.z, 0, 1e-4)).toBe(true);
    });

    it("falls back to a single body when the root has no physics children", () => {
        const addSpy = jest.spyOn(Physics, "add").mockImplementation(() => {});
        const rootBody = new Object3D();
        const root = makeElement("lonely", { colliderType: COLLIDER_TYPES.BOX }, rootBody, []);

        Physics.realizeSubtree(root);

        expect(addSpy).toHaveBeenCalledTimes(1);
        expect(Physics.worker.postMessage).not.toHaveBeenCalled();
        addSpy.mockRestore();
    });
});
