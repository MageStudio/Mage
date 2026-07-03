import { CF_STATIC_OBJECT, CF_KINEMATIC_OBJECT, DISABLE_DEACTIVATION } from "../../constants";

jest.mock("../world", () => ({
    __esModule: true,
    default: { addRigidBody: jest.fn(), addElement: jest.fn(), getElement: jest.fn() },
}));
jest.mock("../lib/dispatcher", () => ({ __esModule: true, default: { sendBodyUpdate: jest.fn() } }));
jest.mock("../lib/math", () => ({ applyMatrix4ToVector3: jest.fn() }));

import world from "../world";
import { makeKinematic, createRigidBody, addBox, addSphere, setQuaternion } from "../elements";

// Minimal fake body that tracks collision flags and activation state.
const makeFakeBody = (initialFlags = CF_STATIC_OBJECT) => {
    let flags = initialFlags;
    return {
        flags: () => flags,
        getCollisionFlags: () => flags,
        setCollisionFlags: jest.fn(f => {
            flags = f;
        }),
        setActivationState: jest.fn(),
        activate: jest.fn(),
        setFriction: jest.fn(),
        setRestitution: jest.fn(),
        setDamping: jest.fn(),
        setCcdMotionThreshold: jest.fn(),
        setCcdSweptSphereRadius: jest.fn(),
        getWorldTransform: jest.fn(),
        setWorldTransform: jest.fn(),
        getMotionState: jest.fn(() => ({ setWorldTransform: jest.fn() })),
        isStaticObject: () => (flags & CF_STATIC_OBJECT) !== 0,
    };
};

// Stub the Ammo global the worker relies on. `initialFlags` lets a test create
// a dynamic body (flags 0) vs the default static one.
const installAmmo = (initialFlags = CF_STATIC_OBJECT) => {
    const body = makeFakeBody(initialFlags);
    const shape = { calculateLocalInertia: jest.fn() };
    global.Ammo = {
        btTransform: function () {
            return { setIdentity: jest.fn(), setOrigin: jest.fn(), setRotation: jest.fn() };
        },
        btVector3: function () {},
        btQuaternion: function () {},
        btDefaultMotionState: function () {},
        btBoxShape: function () {
            return shape;
        },
        btSphereShape: function () {
            return shape;
        },
        btRigidBodyConstructionInfo: function () {},
        btRigidBody: function () {
            return body;
        },
    };
    return body;
};

afterEach(() => {
    delete global.Ammo;
    jest.clearAllMocks();
});

describe("makeKinematic", () => {
    it("clears the static flag, sets the kinematic flag, and keeps the body awake", () => {
        const body = makeFakeBody(CF_STATIC_OBJECT);

        makeKinematic(body);

        expect(body.flags() & CF_STATIC_OBJECT).toBe(0);
        expect(body.flags() & CF_KINEMATIC_OBJECT).toBe(CF_KINEMATIC_OBJECT);
        expect(body.setActivationState).toHaveBeenCalledWith(DISABLE_DEACTIVATION);
        expect(body.activate).toHaveBeenCalledWith(true);
    });
});

describe("createRigidBody", () => {
    const options = {
        uuid: "x",
        position: { x: 0, y: 0, z: 0 },
        quaternion: { x: 0, y: 0, z: 0, w: 1 },
    };

    it("makes a mass-0 body kinematic when the kinematic flag is set", () => {
        const body = installAmmo();

        createRigidBody(new Ammo.btBoxShape(), { ...options, mass: 0, kinematic: true });

        expect(body.flags() & CF_KINEMATIC_OBJECT).toBe(CF_KINEMATIC_OBJECT);
        expect(world.addRigidBody).toHaveBeenCalledWith(body);
    });

    it("leaves a mass-0 body static when kinematic is not set", () => {
        const body = installAmmo();

        createRigidBody(new Ammo.btBoxShape(), { ...options, mass: 0 });

        expect(body.setCollisionFlags).not.toHaveBeenCalled();
    });
});

describe("continuous collision detection", () => {
    const base = {
        position: { x: 0, y: 0, z: 0 },
        quaternion: { x: 0, y: 0, z: 0, w: 1 },
    };

    it("enables CCD on a dynamic sphere, sized from its radius", () => {
        const body = installAmmo(0); // dynamic
        addSphere({ uuid: "s", radius: 2, mass: 10, ...base });

        expect(body.setCcdMotionThreshold).toHaveBeenCalledWith(2 * 0.5);
        expect(body.setCcdSweptSphereRadius).toHaveBeenCalledWith(2 * 0.8);
    });

    it("does not enable CCD on a mass-0 (kinematic/static) body", () => {
        const body = installAmmo();
        addSphere({ uuid: "s", radius: 2, mass: 0, kinematic: true, ...base });

        expect(body.setCcdMotionThreshold).not.toHaveBeenCalled();
    });
});

describe("auto-promotion on script-driven rotation", () => {
    it("promotes a static body to kinematic the first time setQuaternion runs", () => {
        installAmmo();
        const body = makeFakeBody(CF_STATIC_OBJECT);
        world.getElement.mockReturnValue({ body });

        setQuaternion({ uuid: "x", quaternion: { x: 0, y: 0, z: 0, w: 1 } });

        expect(body.flags() & CF_KINEMATIC_OBJECT).toBe(CF_KINEMATIC_OBJECT);
    });

    it("does not touch a dynamic body's collision flags", () => {
        installAmmo();
        const body = makeFakeBody(0); // not static => dynamic
        world.getElement.mockReturnValue({ body });

        setQuaternion({ uuid: "x", quaternion: { x: 0, y: 0, z: 0, w: 1 } });

        expect(body.setCollisionFlags).not.toHaveBeenCalled();
    });
});
