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

    it("sizes a rotated child by its true extents, not the inflated world AABB", () => {
        // A thin upright wall (1 x 4 x 0.2) rotated 45° about Y and parented to an
        // unrotated floor. Its world-axis-aligned AABB footprint is inflated to
        // ~0.85 x 0.85; the collider must instead keep the true 1 x 0.2 footprint.
        const floorBody = new Mesh(new BoxGeometry(10, 1, 10));
        const wallBody = new Mesh(new BoxGeometry(1, 4, 0.2));
        wallBody.position.set(0, 2.5, 3);
        wallBody.rotation.set(0, Math.PI / 4, 0); // 45° about Y
        floorBody.add(wallBody);
        floorBody.updateMatrixWorld(true);

        const wall = makeElement("wall", { colliderType: COLLIDER_TYPES.BOX }, wallBody);
        const floor = makeElement("floor", { colliderType: COLLIDER_TYPES.BOX }, floorBody, [wall]);

        Physics.realizeSubtree(floor);

        const msg = Physics.worker.postMessage.mock.calls[0][0];
        const wallShape = msg.shapes.find(s => s.childUuid === "wall");
        // True extents preserved (not the ~0.85 inflated AABB).
        expect(near(wallShape.width, 1, 1e-3)).toBe(true);
        expect(near(wallShape.height, 4, 1e-3)).toBe(true);
        expect(near(wallShape.length, 0.2, 1e-3)).toBe(true);
        // Centered at the wall's world position, in the (unrotated) root frame.
        expect(near(wallShape.localPosition.x, 0, 1e-3)).toBe(true);
        expect(near(wallShape.localPosition.y, 2.5, 1e-3)).toBe(true);
        expect(near(wallShape.localPosition.z, 3, 1e-3)).toBe(true);

        // The floor shape must NOT swallow the wall child's geometry.
        const floorShape = msg.shapes.find(s => s.childUuid === "floor");
        expect(near(floorShape.width, 10, 1e-3)).toBe(true);
        expect(near(floorShape.height, 1, 1e-3)).toBe(true);
        expect(near(floorShape.length, 10, 1e-3)).toBe(true);
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

    it("skips the root shape when the root's colliderType is NONE", () => {
        // A geometry-less holder groups two slats; with NONE it contributes no
        // shape of its own, so the gap between the slats stays open.
        const rootBody = new Object3D();
        const slatABody = new Mesh(new BoxGeometry(2, 0.2, 1));
        slatABody.position.set(-2, 0, 0);
        const slatBBody = new Mesh(new BoxGeometry(2, 0.2, 1));
        slatBBody.position.set(2, 0, 0);
        rootBody.add(slatABody);
        rootBody.add(slatBBody);
        rootBody.updateMatrixWorld(true);

        const slatA = makeElement("slatA", { colliderType: COLLIDER_TYPES.BOX }, slatABody);
        const slatB = makeElement("slatB", { colliderType: COLLIDER_TYPES.BOX }, slatBBody);
        const root = makeElement("holder", { colliderType: COLLIDER_TYPES.NONE }, rootBody, [
            slatA,
            slatB,
        ]);

        Physics.realizeSubtree(root);

        const msg = Physics.worker.postMessage.mock.calls[0][0];
        expect(msg.event).toBe(PHYSICS_EVENTS.ADD.COMPOUND);
        // Only the slats — no shape for the NONE root.
        expect(msg.shapes.map(s => s.childUuid).sort()).toEqual(["slatA", "slatB"]);
        // Children still expressed in the root's frame.
        const a = msg.shapes.find(s => s.childUuid === "slatA");
        expect(near(a.localPosition.x, -2, 1e-3)).toBe(true);
    });

    it("throws when every collider in the subtree is NONE", () => {
        const rootBody = new Object3D();
        const childBody = new Object3D();
        rootBody.add(childBody);
        rootBody.updateMatrixWorld(true);

        const child = makeElement("child", { colliderType: COLLIDER_TYPES.NONE }, childBody);
        const root = makeElement("root", { colliderType: COLLIDER_TYPES.NONE }, rootBody, [
            child,
        ]);

        expect(() => Physics.realizeSubtree(root)).toThrow(/NONE/);
        expect(Physics.worker.postMessage).not.toHaveBeenCalled();
    });

    it("throws for a standalone element with colliderType NONE", () => {
        const root = makeElement("lonely", { colliderType: COLLIDER_TYPES.NONE }, new Object3D());
        expect(() => Physics.realizeSubtree(root)).toThrow(/NONE/);
    });

    it("gives a geometry-less root a unit box, not the subtree's AABB", () => {
        // Regression: the fallback used to measure Box3.setFromObject(root),
        // which only ever picks up the (excluded) children's geometry — turning
        // a holder root into one giant box that fills the gaps between slats.
        const rootBody = new Object3D(); // no geometry of its own
        const slatABody = new Mesh(new BoxGeometry(2, 0.2, 1));
        slatABody.position.set(-4, 0, 0);
        const slatBBody = new Mesh(new BoxGeometry(2, 0.2, 1));
        slatBBody.position.set(4, 0, 0);
        rootBody.add(slatABody);
        rootBody.add(slatBBody);
        rootBody.updateMatrixWorld(true);

        const slatA = makeElement("slatA", { colliderType: COLLIDER_TYPES.BOX }, slatABody);
        const slatB = makeElement("slatB", { colliderType: COLLIDER_TYPES.BOX }, slatBBody);
        const root = makeElement("holder", { colliderType: COLLIDER_TYPES.BOX }, rootBody, [
            slatA,
            slatB,
        ]);

        Physics.realizeSubtree(root);

        const msg = Physics.worker.postMessage.mock.calls[0][0];
        const holderShape = msg.shapes.find(s => s.childUuid === "holder");
        // Unit box at the root origin — NOT ~10 wide spanning both slats.
        expect(near(holderShape.width, 1, 1e-3)).toBe(true);
        expect(near(holderShape.height, 1, 1e-3)).toBe(true);
        expect(near(holderShape.length, 1, 1e-3)).toBe(true);
        expect(holderShape.localPosition).toEqual({ x: 0, y: 0, z: 0 });
    });
});
