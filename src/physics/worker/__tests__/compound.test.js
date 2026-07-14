import { TYPES, COLLIDER_TYPES } from "../../constants";

jest.mock("../world", () => ({
    __esModule: true,
    default: { addRigidBody: jest.fn(), addElement: jest.fn(), getElement: jest.fn() },
}));
jest.mock("../lib/dispatcher", () => ({
    __esModule: true,
    default: { sendBodyUpdate: jest.fn() },
}));
jest.mock("../lib/math", () => ({ applyMatrix4ToVector3: jest.fn() }));

import world from "../world";
import { addCompound } from "../elements";

// Fake Ammo just rich enough for addCompound → createRigidBody. We only assert
// on how our code drives it (addChildShape count, childMap contents), not on
// real physics — the real-Ammo proof lives in scripts/verify-compound-colliders.js.
const installAmmo = () => {
    const addChildShape = jest.fn();
    const compound = { addChildShape, calculateLocalInertia: jest.fn() };
    const body = {
        getCollisionFlags: () => 1,
        setCollisionFlags: jest.fn(),
        setActivationState: jest.fn(),
        activate: jest.fn(),
        setFriction: jest.fn(),
    };
    global.Ammo = {
        btCompoundShape: function () {
            return compound;
        },
        btBoxShape: function () {
            return { calculateLocalInertia: jest.fn() };
        },
        btSphereShape: function () {
            return { calculateLocalInertia: jest.fn() };
        },
        btTransform: function () {
            return { setIdentity: jest.fn(), setOrigin: jest.fn(), setRotation: jest.fn() };
        },
        btVector3: function (x, y, z) {
            return { x, y, z };
        },
        btQuaternion: function (x, y, z, w) {
            return { x, y, z, w };
        },
        btDefaultMotionState: function () {
            return {};
        },
        btRigidBodyConstructionInfo: function () {
            return {};
        },
        btRigidBody: function () {
            return body;
        },
        destroy: jest.fn(),
    };
    return { compound, body, addChildShape };
};

afterEach(() => {
    delete global.Ammo;
    jest.clearAllMocks();
});

const box = (childUuid, dims, localPosition) => ({
    childUuid,
    colliderType: COLLIDER_TYPES.BOX,
    localPosition,
    localQuaternion: { x: 0, y: 0, z: 0, w: 1 },
    ...dims,
});

const floorWithWall = {
    uuid: "floor",
    position: { x: 1, y: 0, z: 2 },
    quaternion: { x: 0, y: 0, z: 0, w: 1 },
    mass: 0,
    kinematic: true,
    friction: 1,
    shapes: [
        box("floor", { width: 10, height: 1, length: 10 }, { x: 0, y: 0, z: 0 }),
        box("wall", { width: 1, height: 4, length: 10 }, { x: 4, y: 2.5, z: 0 }),
    ],
};

describe("addCompound", () => {
    it("adds one child shape to the compound per collider", () => {
        const { addChildShape } = installAmmo();

        addCompound(floorWithWall);

        expect(addChildShape).toHaveBeenCalledTimes(2);
    });

    it("registers a COMPOUND element with a childMap mapping shape index → child uuid", () => {
        installAmmo();

        addCompound(floorWithWall);

        expect(world.addElement).toHaveBeenCalledTimes(1);
        const entry = world.addElement.mock.calls[0][0];
        expect(entry.uuid).toBe("floor");
        expect(entry.type).toBe(TYPES.COMPOUND);
        expect(entry.childMap).toHaveLength(2);
        expect(entry.childMap[0].uuid).toBe("floor");
        expect(entry.childMap[1].uuid).toBe("wall");
    });

    it("stores each child's local placement and half-extents for contact resolution", () => {
        installAmmo();

        addCompound(floorWithWall);

        const { childMap } = world.addElement.mock.calls[0][0];
        expect(childMap[1].localPosition).toEqual({ x: 4, y: 2.5, z: 0 });
        // width 1, height 4, length 10 → half-extents 0.5, 2, 5
        expect(childMap[1].halfExtents).toEqual({ x: 0.5, y: 2, z: 5 });
    });

    it("builds a sphere leaf and records its radius", () => {
        installAmmo();

        addCompound({
            ...floorWithWall,
            shapes: [
                {
                    childUuid: "ball",
                    colliderType: COLLIDER_TYPES.SPHERE,
                    radius: 1.5,
                    localPosition: { x: 0, y: 0, z: 0 },
                    localQuaternion: { x: 0, y: 0, z: 0, w: 1 },
                },
            ],
        });

        const { childMap } = world.addElement.mock.calls[0][0];
        expect(childMap[0].colliderType).toBe(COLLIDER_TYPES.SPHERE);
        expect(childMap[0].radius).toBe(1.5);
    });
});
