import { TYPES, COLLIDER_TYPES } from "../../constants";

const store = {};
jest.mock("../world", () => ({
    __esModule: true,
    default: {
        addRigidBody: jest.fn(),
        addElement: jest.fn(el => {
            store[el.uuid] = el;
        }),
        getElement: jest.fn(uuid => store[uuid]),
    },
}));
jest.mock("../lib/dispatcher", () => ({
    __esModule: true,
    default: { sendBodyUpdate: jest.fn() },
}));
jest.mock("../lib/math", () => ({ applyMatrix4ToVector3: jest.fn() }));

import { addCompound, setChildTransform } from "../elements";

let resolveChildUuid;
beforeAll(() => {
    global.self = global;
    resolveChildUuid = jest.requireActual("../world").resolveChildUuid;
});

const installAmmo = () => {
    const updateChildTransform = jest.fn();
    const compound = {
        addChildShape: jest.fn(),
        updateChildTransform,
        calculateLocalInertia: jest.fn(),
    };
    const body = {
        getCollisionFlags: jest.fn(() => 1),
        setCollisionFlags: jest.fn(),
        setActivationState: jest.fn(),
        activate: jest.fn(),
        setFriction: jest.fn(),
        setWorldTransform: jest.fn(),
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
            const t = {
                setIdentity: jest.fn(),
                setOrigin: o => {
                    t.origin = { x: o.x, y: o.y, z: o.z };
                },
                setRotation: r => {
                    t.rotation = { x: r.x, y: r.y, z: r.z, w: r.w };
                },
            };
            return t;
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
        // Snapshot at destroy time would be too late: capture on the call instead.
        destroy: jest.fn(),
    };
    return { compound, body, updateChildTransform };
};

const Q = { x: 0, y: 0, z: 0, w: 1 };
const box = (childUuid, localPosition, dims = {}) => ({
    childUuid,
    colliderType: COLLIDER_TYPES.BOX,
    localPosition,
    localQuaternion: Q,
    width: 1,
    height: 1,
    length: 1,
    ...dims,
});

const build = shapes =>
    addCompound({
        uuid: "platform",
        position: { x: 1, y: 2, z: 3 },
        quaternion: Q,
        mass: 0,
        kinematic: true,
        shapes,
    });

afterEach(() => {
    delete global.Ammo;
    Object.keys(store).forEach(k => delete store[k]);
    jest.clearAllMocks();
});

describe("setChildTransform", () => {
    it("updates the transform of every leaf of the child, and only those", () => {
        const { updateChildTransform } = installAmmo();
        build([
            box("platform", { x: 0, y: 0, z: 0 }),
            box("swiper", { x: 2, y: 0, z: 0 }),
            box("swiper", { x: 2, y: 0, z: 0 }), // second hull of the same element
            box("other", { x: -2, y: 0, z: 0 }),
        ]);

        setChildTransform({
            uuid: "platform",
            children: [
                {
                    uuid: "swiper",
                    localPosition: { x: 5, y: 6, z: 7 },
                    localQuaternion: { x: 0, y: 1, z: 0, w: 0 },
                },
            ],
        });

        expect(updateChildTransform).toHaveBeenCalledTimes(2);
        expect(updateChildTransform.mock.calls.map(c => c[0])).toEqual([1, 2]);
        const transform = updateChildTransform.mock.calls[0][1];
        expect(transform.origin).toEqual({ x: 5, y: 6, z: 7 });
        expect(transform.rotation).toEqual({ x: 0, y: 1, z: 0, w: 0 });
    });

    it("leaves the rigid body, its world transform and flags untouched", () => {
        const { body } = installAmmo();
        build([box("platform", { x: 0, y: 0, z: 0 }), box("swiper", { x: 2, y: 0, z: 0 })]);
        const entry = store.platform;
        const flagWrites = body.setCollisionFlags.mock.calls.length;

        setChildTransform({
            uuid: "platform",
            children: [{ uuid: "swiper", localPosition: { x: 0, y: 4, z: 0 }, localQuaternion: Q }],
        });

        expect(store.platform).toBe(entry);
        expect(entry.body).toBe(body);
        expect(body.setWorldTransform).not.toHaveBeenCalled();
        expect(body.setCollisionFlags).toHaveBeenCalledTimes(flagWrites);
    });

    it("keeps contact resolution in step with the child's new region", () => {
        installAmmo();
        build([
            box("platform", { x: 0, y: 0, z: 0 }, { width: 2, height: 2, length: 2 }),
            box("swiper", { x: 10, y: 0, z: 0 }, { width: 2, height: 2, length: 2 }),
        ]);
        const vec = (x, y, z) => ({ x: () => x, y: () => y, z: () => z });
        expect(resolveChildUuid(store.platform, vec(-10, 0, 0))).toBe("platform");

        setChildTransform({
            uuid: "platform",
            children: [
                { uuid: "swiper", localPosition: { x: -10, y: 0, z: 0 }, localQuaternion: Q },
            ],
        });

        expect(resolveChildUuid(store.platform, vec(-10, 0, 0))).toBe("swiper");
        expect(store.platform.type).toBe(TYPES.COMPOUND);
    });

    it("moves several children (member plus descendants) in one message", () => {
        const { updateChildTransform } = installAmmo();
        build([
            box("platform", { x: 0, y: 0, z: 0 }),
            box("swiper", { x: 2, y: 0, z: 0 }),
            box("tip", { x: 3, y: 0, z: 0 }),
        ]);

        setChildTransform({
            uuid: "platform",
            children: [
                { uuid: "swiper", localPosition: { x: 0, y: 2, z: 0 }, localQuaternion: Q },
                { uuid: "tip", localPosition: { x: 0, y: 3, z: 0 }, localQuaternion: Q },
            ],
        });

        expect(updateChildTransform.mock.calls.map(c => c[0])).toEqual([1, 2]);
        expect(store.platform.childMap[2].localPosition).toEqual({ x: 0, y: 3, z: 0 });
    });

    it("throws for an unknown root uuid", () => {
        installAmmo();
        expect(() => setChildTransform({ uuid: "nope", children: [] })).toThrow(/nope/);
    });

    it("throws for an unknown child uuid, changing nothing", () => {
        const { updateChildTransform } = installAmmo();
        build([box("platform", { x: 0, y: 0, z: 0 })]);

        expect(() =>
            setChildTransform({
                uuid: "platform",
                children: [
                    { uuid: "ghost", localPosition: { x: 1, y: 1, z: 1 }, localQuaternion: Q },
                ],
            }),
        ).toThrow(/ghost/);
        expect(updateChildTransform).not.toHaveBeenCalled();
    });
});
