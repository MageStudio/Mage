import { Object3D, Mesh, BoxGeometry, Quaternion, Vector3 } from "three";
import { PHYSICS_EVENTS } from "../messages";
import { COLLIDER_TYPES } from "../constants";
import { extractHullPoints } from "../utils";

jest.mock("worker:./worker", () => ({ __esModule: true, default: class {} }), { virtual: true });
jest.mock("../../core/config", () => ({
    __esModule: true,
    default: { physics: () => ({ enabled: true }) },
}));

import Physics from "../index";

const makeElement = (id, options, body, children = []) => ({
    children,
    isPhysicsEnabled: () => true,
    uuid: () => id,
    getPhysicsOptions: key => (key ? options[key] : options),
    getBody: () => body,
});

const boxMesh = (size = 2) => {
    const mesh = new Mesh(new BoxGeometry(size, size, size));
    mesh.updateMatrixWorld(true);
    return mesh;
};

const lastMessage = () => {
    const calls = Physics.worker.postMessage.mock.calls;
    return calls[calls.length - 1][0];
};

beforeEach(() => {
    Physics.elements = [];
    Physics.worker = { postMessage: jest.fn() };
});

describe("extractHullPoints", () => {
    it("reduces a box mesh to its eight corners in the leaf frame", () => {
        const points = extractHullPoints(boxMesh(2), new Vector3(0, 0, 0), new Quaternion());

        // 8 corners × 3 components. QuickHull keeps only extreme vertices, so the
        // 24 duplicated BoxGeometry vertices collapse to 8.
        expect(points).toHaveLength(24);

        for (let i = 0; i < points.length; i += 3) {
            expect(Math.abs(points[i])).toBeCloseTo(1);
            expect(Math.abs(points[i + 1])).toBeCloseTo(1);
            expect(Math.abs(points[i + 2])).toBeCloseTo(1);
        }
    });

    it("expresses points relative to the collider's world centre", () => {
        const mesh = boxMesh(2);
        mesh.position.set(10, 5, -3);
        mesh.updateMatrixWorld(true);

        // Passing the mesh's own world centre must re-centre the hull on the
        // origin — otherwise the leaf would be offset twice.
        const points = extractHullPoints(mesh, new Vector3(10, 5, -3), new Quaternion());

        for (let i = 0; i < points.length; i += 3) {
            expect(Math.abs(points[i])).toBeCloseTo(1);
            expect(Math.abs(points[i + 1])).toBeCloseTo(1);
            expect(Math.abs(points[i + 2])).toBeCloseTo(1);
        }
    });

    it("bakes the element's scale into the hull", () => {
        const mesh = boxMesh(2);
        mesh.scale.set(3, 1, 1);
        mesh.updateMatrixWorld(true);

        const points = extractHullPoints(mesh, new Vector3(0, 0, 0), new Quaternion());

        const xs = [];
        for (let i = 0; i < points.length; i += 3) xs.push(Math.abs(points[i]));
        expect(Math.max(...xs)).toBeCloseTo(3);
    });

    it("removes the element's world rotation", () => {
        const mesh = boxMesh(2);
        const quaternion = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 4);
        mesh.quaternion.copy(quaternion);
        mesh.updateMatrixWorld(true);

        // With the rotation removed the hull is axis-aligned again: the leaf's
        // localQuaternion re-applies it, so baking it in would rotate twice.
        const points = extractHullPoints(mesh, new Vector3(0, 0, 0), quaternion);

        for (let i = 0; i < points.length; i += 3) {
            expect(Math.abs(points[i])).toBeCloseTo(1);
            expect(Math.abs(points[i + 2])).toBeCloseTo(1);
        }
    });

    it("returns null when there is no geometry to wrap", () => {
        expect(extractHullPoints(new Object3D(), new Vector3(), new Quaternion())).toBeNull();
    });

    it("skips the subtrees of sibling colliders", () => {
        const parent = boxMesh(2);
        const child = boxMesh(2);
        child.position.set(50, 0, 0);
        parent.add(child);
        parent.updateMatrixWorld(true);

        const points = extractHullPoints(
            parent,
            new Vector3(0, 0, 0),
            new Quaternion(),
            new Set([child]),
        );

        // Without the exclusion the hull would stretch out to x = 51.
        for (let i = 0; i < points.length; i += 3) {
            expect(Math.abs(points[i])).toBeCloseTo(1);
        }
    });
});

describe("Physics.realizeSubtree with a HULL collider", () => {
    it("emits a compound whose leaf carries hull points", () => {
        const element = makeElement(
            "hull-1",
            { colliderType: COLLIDER_TYPES.MODEL_SHAPE },
            boxMesh(2),
        );

        Physics.realizeSubtree(element);

        const message = lastMessage();
        expect(message.event).toBe(PHYSICS_EVENTS.ADD.COMPOUND);
        expect(message.shapes).toHaveLength(1);
        expect(message.shapes[0].colliderType).toBe(COLLIDER_TYPES.MODEL_SHAPE);
        expect(message.shapes[0].points).toHaveLength(24);
    });

    it("keeps the measured box on the leaf so CCD and contact attribution still work", () => {
        const element = makeElement(
            "hull-2",
            { colliderType: COLLIDER_TYPES.MODEL_SHAPE },
            boxMesh(2),
        );

        Physics.realizeSubtree(element);

        const [shape] = lastMessage().shapes;
        expect(shape.width).toBeCloseTo(2);
        expect(shape.height).toBeCloseTo(2);
        expect(shape.length).toBeCloseTo(2);
    });

    it("falls back to a BOX when the element has no geometry", () => {
        const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
        const element = makeElement(
            "hull-3",
            { colliderType: COLLIDER_TYPES.MODEL_SHAPE },
            new Object3D(),
        );

        Physics.realizeSubtree(element);

        const [shape] = lastMessage().shapes;
        expect(shape.colliderType).toBe(COLLIDER_TYPES.BOX);
        expect(shape.points).toBeUndefined();
        expect(warn).toHaveBeenCalled();
        warn.mockRestore();
    });

    it("welds a hull child into its parent's compound", () => {
        const rootBody = boxMesh(2);
        const childBody = boxMesh(2);
        childBody.position.set(4, 0, 0);
        rootBody.add(childBody);
        rootBody.updateMatrixWorld(true);

        const child = makeElement("child", { colliderType: COLLIDER_TYPES.MODEL_SHAPE }, childBody);
        const root = makeElement("root", { colliderType: COLLIDER_TYPES.BOX }, rootBody, [child]);

        Physics.realizeSubtree(root);

        const message = lastMessage();
        expect(message.shapes).toHaveLength(2);
        expect(message.shapes[1].colliderType).toBe(COLLIDER_TYPES.MODEL_SHAPE);
        expect(message.shapes[1].points.length).toBeGreaterThan(0);
        expect(message.shapes[1].localPosition.x).toBeCloseTo(4);
    });
});

describe("Physics.realizeSubtree collisionEvents", () => {
    it("forwards the flag to the worker", () => {
        const element = makeElement(
            "static-1",
            { colliderType: COLLIDER_TYPES.BOX, mass: 0, collisionEvents: true },
            boxMesh(2),
        );

        Physics.realizeSubtree(element);

        expect(lastMessage().collisionEvents).toBe(true);
    });

    it("defaults to false", () => {
        const element = makeElement("static-2", { colliderType: COLLIDER_TYPES.BOX }, boxMesh(2));

        Physics.realizeSubtree(element);

        expect(lastMessage().collisionEvents).toBe(false);
    });
});
