import { COLLIDER_TYPES, CF_KINEMATIC_OBJECT } from "../../constants";
import { installFakeAmmo, makeDynamicsWorld } from "./fakeAmmo";

jest.mock("../lib/dispatcher", () => ({
    __esModule: true,
    default: { sendBodyUpdate: jest.fn(), sendElementDisposed: jest.fn() },
}));

let world;
let dispatcher;
let elements;
let vehicles;
let effects;
let Ammo;

const Q = { x: 0, y: 0, z: 0, w: 1 };
const P = { x: 1, y: 2, z: 3 };

beforeAll(() => {
    global.self = global;
    world = require("../world").default;
    dispatcher = require("../lib/dispatcher").default;
    elements = require("../elements");
    vehicles = require("../vehicles");
    effects = require("../effects");
});

beforeEach(() => {
    jest.clearAllMocks();
    Ammo = installFakeAmmo();
    world.elements = {};
    world.dynamicsWorld = makeDynamicsWorld(Ammo.log);
    world.dynamicsWorld.addRigidBody = jest.fn();
});

const addModelElement = uuid =>
    elements.addModel({
        uuid,
        vertices: [[0, 0, 0, 1, 0, 0, 0, 1, 0]],
        indexes: [null],
        matrices: [[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]],
        position: P,
        quaternion: Q,
    });

describe("creation paths keep only long-lived objects", () => {
    test("createRigidBody keeps the body and its motion state (shape is the caller's)", () => {
        const shape = new Ammo.btSphereShape(1);
        elements.createRigidBody(shape, { uuid: "a", position: P, quaternion: Q, mass: 1 });

        expect(Ammo.liveTypes()).toEqual(
            ["btDefaultMotionState", "btRigidBody", "btSphereShape"].sort(),
        );
    });

    test("addBox keeps body, motion state and shape", () => {
        elements.addBox({ uuid: "a", width: 1, height: 1, length: 1, position: P, quaternion: Q });

        expect(Ammo.liveTypes()).toEqual(["btBoxShape", "btDefaultMotionState", "btRigidBody"]);
    });

    test("addSphere keeps body, motion state and shape", () => {
        elements.addSphere({ uuid: "a", radius: 1, position: P, quaternion: Q });

        expect(Ammo.liveTypes()).toEqual(["btDefaultMotionState", "btRigidBody", "btSphereShape"]);
    });

    test("addCompound keeps body, motion state, compound and one shape per leaf", () => {
        elements.addCompound({
            uuid: "a",
            position: P,
            quaternion: Q,
            shapes: [
                { colliderType: COLLIDER_TYPES.BOX, childUuid: "a" },
                { colliderType: COLLIDER_TYPES.SPHERE, childUuid: "b", radius: 1 },
            ],
        });

        expect(Ammo.liveTypes()).toEqual(
            [
                "btBoxShape",
                "btCompoundShape",
                "btDefaultMotionState",
                "btRigidBody",
                "btSphereShape",
            ].sort(),
        );
    });

    test("addModel keeps body, motion state, BVH shape and triangle mesh", () => {
        addModelElement("a");

        expect(Ammo.liveTypes()).toEqual([
            "btBvhTriangleMeshShape",
            "btDefaultMotionState",
            "btRigidBody",
            "btTriangleMesh",
        ]);
    });
});

describe("S5 disposeBody destroys the body, motion state and shape", () => {
    const disposeAndCheck = uuid => {
        world.disposeBody({ uuid });

        expect(Ammo.liveTypes()).toEqual([]);
        expect(Ammo.doubleDestroyed).toEqual([]);
        expect(Ammo.log.indexOf("removeRigidBody")).toBeGreaterThan(-1);
        expect(Ammo.log.indexOf("removeRigidBody")).toBeLessThan(
            Ammo.log.indexOf("destroy:btRigidBody"),
        );
        expect(dispatcher.sendElementDisposed).toHaveBeenCalledWith({ uuid });
    };

    test("S5 box", () => {
        elements.addBox({ uuid: "a", width: 1, height: 1, length: 1, position: P, quaternion: Q });
        disposeAndCheck("a");
    });

    test("S5 sphere", () => {
        elements.addSphere({ uuid: "a", radius: 1, position: P, quaternion: Q });
        disposeAndCheck("a");
    });

    test("S5 compound destroys every child leaf and the compound, compound first", () => {
        elements.addCompound({
            uuid: "a",
            position: P,
            quaternion: Q,
            shapes: [
                { colliderType: COLLIDER_TYPES.BOX, childUuid: "a" },
                { colliderType: COLLIDER_TYPES.SPHERE, childUuid: "b", radius: 1 },
            ],
        });
        world.disposeBody({ uuid: "a" });

        expect(Ammo.liveTypes()).toEqual([]);
        expect(Ammo.doubleDestroyed).toEqual([]);
        expect(Ammo.log.indexOf("destroy:btCompoundShape")).toBeLessThan(
            Ammo.log.indexOf("destroy:btBoxShape"),
        );
    });

    test("S5 model destroys the BVH shape before its triangle mesh", () => {
        addModelElement("a");
        world.disposeBody({ uuid: "a" });

        expect(Ammo.liveTypes()).toEqual([]);
        expect(Ammo.doubleDestroyed).toEqual([]);
        expect(Ammo.log.indexOf("destroy:btBvhTriangleMeshShape")).toBeLessThan(
            Ammo.log.indexOf("destroy:btTriangleMesh"),
        );
    });
});

describe("disposeBody safety", () => {
    test("unknown uuid warns and does nothing", () => {
        const warn = jest.spyOn(console, "warn").mockImplementation(() => {});

        expect(() => world.disposeBody({ uuid: "nope" })).not.toThrow();

        expect(warn).toHaveBeenCalled();
        expect(Ammo.log).toEqual([]);
        expect(dispatcher.sendElementDisposed).not.toHaveBeenCalled();
        warn.mockRestore();
    });

    test("disposing twice destroys once", () => {
        const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
        elements.addSphere({ uuid: "a", radius: 1, position: P, quaternion: Q });

        world.disposeBody({ uuid: "a" });
        world.disposeBody({ uuid: "a" });

        expect(Ammo.doubleDestroyed).toEqual([]);
        expect(world.dynamicsWorld.removeRigidBody).toHaveBeenCalledTimes(1);
        warn.mockRestore();
    });

    test("the record is gone immediately so simulate never touches freed objects", () => {
        elements.addSphere({ uuid: "a", radius: 1, position: P, quaternion: Q });
        world.disposeBody({ uuid: "a" });

        expect(world.hasElement("a")).toBe(false);
    });

    test("DISPOSE then ADD with the same uuid (refreshOwningBody) works", () => {
        elements.addSphere({ uuid: "a", radius: 1, position: P, quaternion: Q });
        world.disposeBody({ uuid: "a" });
        elements.addSphere({ uuid: "a", radius: 2, position: P, quaternion: Q });

        expect(world.hasElement("a")).toBe(true);
        world.disposeBody({ uuid: "a" });
        expect(Ammo.liveTypes()).toEqual([]);
    });
});

describe("S6 setters leave no undestroyed temporaries", () => {
    const expectNoLeak = (setup, action) => {
        setup();
        const before = Ammo.liveTypes();
        action();
        expect(Ammo.liveTypes()).toEqual(before);
    };

    test("S6 setPosition", () => {
        expectNoLeak(
            () =>
                elements.addBox({
                    uuid: "a",
                    width: 1,
                    height: 1,
                    length: 1,
                    position: P,
                    quaternion: Q,
                    mass: 1,
                }),
            () => elements.setPosition({ uuid: "a", position: { x: 4, y: 5, z: 6 } }),
        );
    });

    test("S6 setQuaternion, non-kinematic branch", () => {
        expectNoLeak(
            () =>
                elements.addBox({
                    uuid: "a",
                    width: 1,
                    height: 1,
                    length: 1,
                    position: P,
                    quaternion: Q,
                    mass: 1,
                }),
            () => elements.setQuaternion({ uuid: "a", quaternion: Q }),
        );
        expect(world.getElement("a").body.getCollisionFlags() & CF_KINEMATIC_OBJECT).toBe(0);
    });

    test("S6 setQuaternion, kinematic origin branch", () => {
        expectNoLeak(
            () =>
                elements.addBox({
                    uuid: "a",
                    width: 1,
                    height: 1,
                    length: 1,
                    position: P,
                    quaternion: Q,
                    kinematic: true,
                }),
            () => elements.setQuaternion({ uuid: "a", quaternion: Q }),
        );
        expect(world.getElement("a").body.getCollisionFlags() & CF_KINEMATIC_OBJECT).not.toBe(0);
    });

    test("S6 resetElement", () => {
        expectNoLeak(
            () =>
                elements.addBox({
                    uuid: "a",
                    width: 1,
                    height: 1,
                    length: 1,
                    position: P,
                    quaternion: Q,
                    mass: 1,
                }),
            () => elements.resetElement({ uuid: "a", position: P, quaternion: Q }),
        );
    });
});

describe("vehicles", () => {
    const wheels = ["w0", "w1", "w2", "w3"];
    const add = () => vehicles.addVehicle({ uuid: "car", position: P, quaternion: Q, wheels });

    test("addVehicle keeps only the chassis, its motion state and shape, tuning, raycaster and vehicle", () => {
        add();

        expect(Ammo.liveTypes()).toEqual(
            [
                "btBoxShape",
                "btDefaultMotionState",
                "btDefaultVehicleRaycaster",
                "btRaycastVehicle",
                "btRigidBody",
                "btVehicleTuning",
            ].sort(),
        );
    });

    test("setVehiclePosition, setVehicleQuaternion and resetVehicle leave nothing behind", () => {
        add();
        const before = Ammo.liveTypes();

        vehicles.setVehiclePosition({ uuid: "car", position: P });
        vehicles.setVehicleQuaternion({ uuid: "car", quaternion: Q });
        vehicles.resetVehicle({ uuid: "car", position: P, quaternion: Q });

        expect(Ammo.liveTypes()).toEqual(before);
    });

    test("S7 disposeBody removes the action and chassis, then destroys every vehicle object", () => {
        add();
        const { vehicle, chassis } = world.getElement("car");

        world.disposeBody({ uuid: "car" });

        expect(world.dynamicsWorld.removeAction).toHaveBeenCalledWith(vehicle);
        expect(world.dynamicsWorld.removeRigidBody).toHaveBeenCalledWith(chassis);
        expect(Ammo.liveTypes()).toEqual([]);
        expect(Ammo.doubleDestroyed).toEqual([]);
        expect(Ammo.log.indexOf("removeAction")).toBeLessThan(
            Ammo.log.indexOf("destroy:btRaycastVehicle"),
        );
        expect(Ammo.log.indexOf("removeRigidBody")).toBeLessThan(
            Ammo.log.indexOf("destroy:btRigidBody"),
        );
        expect(world.getElement("car")).toBeUndefined();
    });
});

describe("effects", () => {
    test("createExplosion from a body leaves nothing undestroyed", () => {
        elements.addSphere({ uuid: "a", radius: 1, position: P, quaternion: Q });
        world.dynamicsWorld.performDiscreteCollisionDetection = jest.fn();
        const before = Ammo.liveTypes();

        effects.createExplosion({ uuid: "a" });

        expect(Ammo.liveTypes()).toEqual(before);
        expect(Ammo.doubleDestroyed).toEqual([]);
    });

    test("createExplosion with a given position does not destroy the caller's vector", () => {
        world.dynamicsWorld.performDiscreteCollisionDetection = jest.fn();
        const position = new Ammo.btVector3(0, 0, 0);

        effects.createExplosion({ uuid: "none", position });

        expect(Ammo.live.has(position)).toBe(true);
        expect(Ammo.liveTypes()).toEqual(["btVector3"]);
    });

    test("getExplosionPosition returns a copy, not a reference into the freed transform", () => {
        elements.addSphere({ uuid: "a", radius: 1, position: P, quaternion: Q });
        const result = effects.getExplosionPosition("a");

        expect(Ammo.live.has(result)).toBe(true);
        expect(Ammo.liveTypes()).not.toContain("btTransform");
    });
});
