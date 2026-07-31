// Alignment spec: for ANY physics element, the collider sent to the worker must
// occupy the same world box as the element's rendered geometry — same world
// center, same un-rotated extents, same world orientation — regardless of
// whether it is a root or a compound child, and regardless of its (and its
// ancestors') position/rotation/scale, and whether its geometry is offset from
// its origin. Uses REAL three (no mock) so the real measurement runs.
import { Object3D, Mesh, BoxGeometry, Quaternion, Euler, Vector3, Box3, Matrix4 } from "three";
import { PHYSICS_EVENTS } from "../messages";
import { COLLIDER_TYPES } from "../constants";

jest.mock("worker:./worker", () => ({ __esModule: true, default: class {} }), { virtual: true });
jest.mock("../../core/config", () => ({
    __esModule: true,
    default: { physics: () => ({ enabled: true }) },
}));

import Physics from "../index";

// ---- fake element wrapping a real three body ---------------------------------
const makeEl = (uuid, body, options, children = []) => {
    const el = {
        _parent: null,
        children,
        isPhysicsEnabled: () => true,
        uuid: () => uuid,
        getPhysicsOptions: k => (k ? options[k] : options),
        getBody: () => body,
        getParent: () => el._parent,
        getScale: () => ({ x: body.scale.x, y: body.scale.y, z: body.scale.z }),
        getPosition: () => ({ x: body.position.x, y: body.position.y, z: body.position.z }),
        getQuaternion: () => body.quaternion.clone(),
    };
    children.forEach(c => (c._parent = el));
    return el;
};

const boxMesh = ({ geo = [1, 1, 1], geoOffset = [0, 0, 0] } = {}) => {
    const m = new Mesh(new BoxGeometry(...geo));
    // Offset the geometry from the mesh origin to exercise centering.
    m.geometry.translate(...geoOffset);
    return m;
};

// ---- expected world box of a mesh's OWN geometry ----------------------------
const expectedWorldBox = (mesh, excludeMeshes = []) => {
    mesh.updateWorldMatrix(true, true);
    const worldQuat = mesh.getWorldQuaternion(new Quaternion());
    const unrotate = new Matrix4().makeRotationFromQuaternion(worldQuat.clone().invert());
    const worldBox = new Box3();
    const sizeBox = new Box3();
    const excluded = new Set(excludeMeshes);
    const visit = obj => {
        if (obj !== mesh && excluded.has(obj)) return;
        if (obj.geometry) {
            if (!obj.geometry.boundingBox) obj.geometry.computeBoundingBox();
            worldBox.union(obj.geometry.boundingBox.clone().applyMatrix4(obj.matrixWorld));
            sizeBox.union(
                obj.geometry.boundingBox
                    .clone()
                    .applyMatrix4(unrotate.clone().multiply(obj.matrixWorld)),
            );
        }
        obj.children.forEach(visit);
    };
    visit(mesh);
    const size = sizeBox.getSize(new Vector3());
    return {
        center: worldBox.getCenter(new Vector3()),
        size: { w: size.x, h: size.y, l: size.z },
        quat: worldQuat,
    };
};

const near = (a, b, eps = 1e-2) => Math.abs(a - b) < eps;
const vNear = (v, e, eps = 1e-2) =>
    near(v.x, e.x, eps) && near(v.y, e.y, eps) && near(v.z, e.z, eps);

// Reconstruct the collider's world placement from a worker message + shape, and
// assert it equals the expected geometry world box.
const assertAligned = (bodyPos, bodyQuat, shape, expected) => {
    const worldCenter = new Vector3(
        shape.localPosition?.x || 0,
        shape.localPosition?.y || 0,
        shape.localPosition?.z || 0,
    )
        .applyQuaternion(bodyQuat)
        .add(bodyPos);
    const localQ = shape.localQuaternion
        ? new Quaternion(
              shape.localQuaternion.x,
              shape.localQuaternion.y,
              shape.localQuaternion.z,
              shape.localQuaternion.w,
          )
        : new Quaternion();
    const worldQuat = bodyQuat.clone().multiply(localQ);

    expect(vNear(worldCenter, expected.center)).toBe(true);
    expect(near(shape.width, expected.size.w)).toBe(true);
    expect(near(shape.height, expected.size.h)).toBe(true);
    expect(near(shape.length, expected.size.l)).toBe(true);
    // Orientation: compare as rotations (allow sign flip of the quaternion).
    const dot = Math.abs(
        worldQuat.x * expected.quat.x +
            worldQuat.y * expected.quat.y +
            worldQuat.z * expected.quat.z +
            worldQuat.w * expected.quat.w,
    );
    expect(near(dot, 1, 1e-2)).toBe(true);
};

// Extract the (bodyPos, bodyQuat, shape) for a given collider uuid from an
// ADD.COMPOUND message (a lone box/sphere realizes as a one-shape compound).
const placementFor = (msg, uuid) => {
    const bodyPos = new Vector3(msg.position.x, msg.position.y, msg.position.z);
    const bodyQuat = new Quaternion(
        msg.quaternion.x,
        msg.quaternion.y,
        msg.quaternion.z,
        msg.quaternion.w,
    );
    const shape = msg.shapes.find(s => s.childUuid === uuid);
    return { bodyPos, bodyQuat, shape };
};

beforeEach(() => {
    Physics.elements = [];
    Physics.pendingRefreshRoots = new Map();
    Physics.refreshTimer = null;
    Physics.worker = { postMessage: jest.fn() };
});

const lastMsg = () => {
    const calls = Physics.worker.postMessage.mock.calls;
    return calls[calls.length - 1][0];
};

const BOX = { colliderType: COLLIDER_TYPES.BOX, mass: 0 };

describe("collider alignment — single root box", () => {
    it("aligns when scaled + rotated + positioned at top level", () => {
        const body = boxMesh();
        body.position.set(5, -2, 3);
        body.scale.set(2.835, 1, 21.53);
        body.quaternion.setFromEuler(new Euler(0.3553, 0, 0));
        new Object3D().add(body); // detached scene root
        body.parent.updateMatrixWorld(true);

        const root = makeEl("slab", body, BOX);
        Physics.realizeSubtree(root);

        const { bodyPos, bodyQuat, shape } = placementFor(lastMsg(), "slab");
        assertAligned(bodyPos, bodyQuat, shape, expectedWorldBox(body));
    });

    it("aligns when the geometry is OFFSET from the element origin", () => {
        const body = boxMesh({ geoOffset: [0, 5, 0] }); // geometry 5 above origin
        body.position.set(0, 0, 0);
        new Object3D().add(body);
        body.parent.updateMatrixWorld(true);

        const root = makeEl("offset", body, BOX);
        Physics.realizeSubtree(root);

        const { bodyPos, bodyQuat, shape } = placementFor(lastMsg(), "offset");
        assertAligned(bodyPos, bodyQuat, shape, expectedWorldBox(body));
    });

    it("aligns when nested under a scaled + rotated non-physics parent", () => {
        const group = new Object3D();
        group.position.set(10, 0, 0);
        group.scale.set(3, 3, 3);
        group.quaternion.setFromEuler(new Euler(0, 0.5, 0));
        const body = boxMesh();
        body.position.set(2, 0, 0); // local to group
        group.add(body);
        group.updateMatrixWorld(true);

        const root = makeEl("nested", body, BOX);
        Physics.realizeSubtree(root);

        const { bodyPos, bodyQuat, shape } = placementFor(lastMsg(), "nested");
        assertAligned(bodyPos, bodyQuat, shape, expectedWorldBox(body));
    });
});

describe("collider alignment — compound child box", () => {
    const realizeParentChild = ({ parentScale, parentRot, childRot, childOffset }) => {
        const parentBody = boxMesh();
        parentBody.position.set(4, 1, -2);
        parentBody.scale.set(...parentScale);
        parentBody.quaternion.setFromEuler(new Euler(...parentRot));
        const childBody = boxMesh({ geoOffset: childOffset || [0, 0, 0] });
        childBody.position.set(1.5, 2, 0); // local to parent
        childBody.quaternion.setFromEuler(new Euler(...(childRot || [0, 0, 0])));
        parentBody.add(childBody);
        new Object3D().add(parentBody);
        parentBody.parent.updateMatrixWorld(true);

        const child = makeEl("child", childBody, BOX);
        const root = makeEl("parent", parentBody, BOX, [child]);
        Physics.realizeSubtree(root);

        const msg = lastMsg();
        expect(msg.event).toBe(PHYSICS_EVENTS.ADD.COMPOUND);
        const bodyPos = new Vector3(msg.position.x, msg.position.y, msg.position.z);
        const bodyQuat = new Quaternion(
            msg.quaternion.x,
            msg.quaternion.y,
            msg.quaternion.z,
            msg.quaternion.w,
        );
        return { msg, bodyPos, bodyQuat, parentBody, childBody };
    };

    it("aligns a child under a uniformly-scaled + rotated parent", () => {
        const { msg, bodyPos, bodyQuat, parentBody, childBody } = realizeParentChild({
            parentScale: [2, 2, 2],
            parentRot: [0.2, 0.3, 0],
            childRot: [0, 0, 0.4],
        });
        assertAligned(
            bodyPos,
            bodyQuat,
            msg.shapes.find(s => s.childUuid === "parent"),
            expectedWorldBox(parentBody, [childBody]),
        );
        assertAligned(
            bodyPos,
            bodyQuat,
            msg.shapes.find(s => s.childUuid === "child"),
            expectedWorldBox(childBody),
        );
    });

    it("aligns a child with OFFSET geometry under a rotated parent", () => {
        const { msg, bodyPos, bodyQuat, parentBody, childBody } = realizeParentChild({
            parentScale: [2, 2, 2],
            parentRot: [0, 0.5, 0],
            childOffset: [0, 3, 0],
        });
        assertAligned(
            bodyPos,
            bodyQuat,
            msg.shapes.find(s => s.childUuid === "child"),
            expectedWorldBox(childBody),
        );
        assertAligned(
            bodyPos,
            bodyQuat,
            msg.shapes.find(s => s.childUuid === "parent"),
            expectedWorldBox(parentBody, [childBody]),
        );
    });

    it("aligns a child under a non-uniformly-scaled but UNROTATED parent", () => {
        const { msg, bodyPos, bodyQuat, childBody } = realizeParentChild({
            parentScale: [2, 1, 5],
            parentRot: [0, 0, 0],
            childRot: [0, 0, 0],
        });
        assertAligned(
            bodyPos,
            bodyQuat,
            msg.shapes.find(s => s.childUuid === "child"),
            expectedWorldBox(childBody),
        );
    });

    // Documented limitation, not a bug: a rotated child under a NON-UNIFORMLY
    // scaled parent is sheared. A rigid box collider cannot represent shear, so
    // no placement is exactly correct. We simply don't assert alignment here.
    it.skip("non-uniform parent scale + rotated child (shear — unrepresentable)", () => {});
});

// Runtime enablePhysics (Element.enablePhysics → Physics.realizeElement) must
// place colliders identically to import (Importer.realizePhysics → realizeSubtree).
describe("collider alignment — runtime enablePhysics path", () => {
    it("realizeElement aligns a scaled+rotated box nested under a non-physics parent", () => {
        const group = new Object3D();
        group.position.set(-4, 2, 1);
        group.quaternion.setFromEuler(new Euler(0, 0.7, 0));
        const body = boxMesh();
        body.position.set(3, 0, 0);
        body.scale.set(2, 1, 6);
        body.quaternion.setFromEuler(new Euler(0.3, 0, 0));
        group.add(body);
        group.updateMatrixWorld(true);

        const el = makeEl("runtime", body, BOX);
        Physics.realizeElement(el);

        const { bodyPos, bodyQuat, shape } = placementFor(lastMsg(), "runtime");
        assertAligned(bodyPos, bodyQuat, shape, expectedWorldBox(body));
    });

    it("absorbs a newly-enabled child into its already-realized physics parent", () => {
        const parentBody = boxMesh();
        parentBody.scale.set(2, 2, 2);
        const childBody = boxMesh();
        childBody.position.set(2, 0, 0);
        parentBody.add(childBody);
        new Object3D().add(parentBody);
        parentBody.parent.updateMatrixWorld(true);

        let childOn = false;
        const child = {
            children: [],
            isPhysicsEnabled: () => childOn,
            uuid: () => "child",
            getPhysicsOptions: k => (k ? BOX[k] : BOX),
            getBody: () => childBody,
            getParent: () => parent,
        };
        const parent = makeEl("parent", parentBody, BOX, [child]);
        child._parent = parent;

        Physics.realizeSubtree(parent); // parent alone (child not yet physics)
        expect(lastMsg().shapes).toHaveLength(1);

        childOn = true; // runtime enable
        Physics.worker.postMessage.mockClear();
        Physics.realizeElement(child);

        const events = Physics.worker.postMessage.mock.calls.map(c => c[0]);
        expect(
            events.some(m => m.event === PHYSICS_EVENTS.ELEMENT.DISPOSE && m.uuid === "parent"),
        ).toBe(true);
        const compound = events.find(m => m.event === PHYSICS_EVENTS.ADD.COMPOUND);
        expect(compound.shapes.map(s => s.childUuid).sort()).toEqual(["child", "parent"]);
    });
});
