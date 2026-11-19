import { TYPES, COLLIDER_TYPES } from "../../constants";
import { createFakeAmmo } from "./fakeAmmo";

jest.mock("../lib/dispatcher", () => ({
    __esModule: true,
    default: {
        sendBodyUpdate: jest.fn(),
        sendPhysicsUpdate: jest.fn(),
        sendElementDisposed: jest.fn(),
        sendDispatchEvent: jest.fn(),
    },
}));

// world.js reads `self` at import time
global.self = global;
const world = require("../world").default;
const elements = require("../elements");
const {
    addVehicle,
    setVehiclePosition,
    setVehicleQuaternion,
    resetVehicle,
} = require("../vehicles");
const { createExplosion } = require("../effects");
const dispatcher = require("../lib/dispatcher").default;

const POS = { x: 1, y: 2, z: 3 };
const QUAT = { x: 0, y: 0, z: 0, w: 1 };
const base = { position: POS, quaternion: QUAT };

let fake;
let events;

beforeEach(() => {
    fake = createFakeAmmo();
    global.Ammo = fake.Ammo;
    events = [];
    world.elements = {};
    world.dynamicsWorld = {
        addRigidBody: jest.fn(),
        addAction: jest.fn(),
        addCollisionObject: jest.fn(),
        removeAction: jest.fn(a => events.push(["removeAction", a])),
        removeRigidBody: jest.fn(b => events.push(["removeRigidBody", b])),
        removeCollisionObject: jest.fn(),
        performDiscreteCollisionDetection: jest.fn(),
    };
    fake.Ammo.destroy.mockImplementation(i => {
        fake.destroyed.push(i);
        events.push(["destroy", i]);
    });
});

afterEach(() => {
    delete global.Ammo;
    jest.clearAllMocks();
});

const eventIndex = (name, instance) => events.findIndex(([n, i]) => n === name && i === instance);

describe("S5 disposeBody destroys the body, motion state and shape", () => {
    const expectBodyTornDown = (body, ...extra) => {
        expect(fake.destroyed).toContain(body);
        expect(fake.destroyed).toContain(body.motionState);
        expect(fake.destroyed).toContain(body.collisionShape);
        extra.forEach(i => expect(fake.destroyed).toContain(i));
        // removed from the dynamics world before it is destroyed
        expect(eventIndex("removeRigidBody", body)).toBeGreaterThanOrEqual(0);
        expect(eventIndex("removeRigidBody", body)).toBeLessThan(eventIndex("destroy", body));
    };

    it("S5 box", () => {
        elements.addBox({ uuid: "b", width: 1, height: 1, length: 1, ...base });
        const { body } = world.getElement("b");

        world.disposeBody({ uuid: "b" });

        expectBodyTornDown(body);
        expect(body.collisionShape.__type).toBe("btBoxShape");
    });

    it("S5 sphere", () => {
        elements.addSphere({ uuid: "s", radius: 1, ...base });
        const { body } = world.getElement("s");

        world.disposeBody({ uuid: "s" });

        expectBodyTornDown(body);
        expect(body.collisionShape.__type).toBe("btSphereShape");
    });

    it("S5 compound destroys every leaf shape plus the compound, compound first", () => {
        elements.addCompound({
            uuid: "c",
            ...base,
            shapes: [
                { colliderType: COLLIDER_TYPES.BOX, childUuid: "c1" },
                { colliderType: COLLIDER_TYPES.SPHERE, childUuid: "c2" },
            ],
        });
        const { body } = world.getElement("c");
        const compound = body.collisionShape;
        expect(compound.childShapes).toHaveLength(2);

        world.disposeBody({ uuid: "c" });

        expectBodyTornDown(body, ...compound.childShapes);
        compound.childShapes.forEach(leaf =>
            expect(eventIndex("destroy", compound)).toBeLessThan(eventIndex("destroy", leaf)),
        );
    });

    it("S5 model destroys the BVH shape and then its triangle mesh", () => {
        elements.addModel({
            uuid: "m",
            ...base,
            vertices: [[0, 0, 0, 1, 0, 0, 0, 1, 0]],
            indexes: [null],
            matrices: [[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]],
        });
        const { body } = world.getElement("m");
        const [triMesh] = body.collisionShape.resources;

        world.disposeBody({ uuid: "m" });

        expectBodyTornDown(body, triMesh);
        expect(body.collisionShape.__type).toBe("btBvhTriangleMeshShape");
        expect(triMesh.__type).toBe("btTriangleMesh");
        expect(eventIndex("destroy", body.collisionShape)).toBeLessThan(
            eventIndex("destroy", triMesh),
        );
    });
});

describe("S6 setters and reset leave no temporaries alive", () => {
    let body;
    let keep;

    beforeEach(() => {
        elements.addBox({ uuid: "b", width: 1, height: 1, length: 1, mass: 1, ...base });
        body = world.getElement("b").body;
        keep = [body, body.motionState, body.collisionShape];
    });

    it("S6 setPosition", () => {
        elements.setPosition({ uuid: "b", position: POS });
        expect(fake.aliveTypes(...keep)).toEqual([]);
    });

    it("S6 setQuaternion, non-kinematic origin branch", () => {
        elements.setQuaternion({ uuid: "b", quaternion: QUAT });
        expect(fake.aliveTypes(...keep)).toEqual([]);
    });

    it("S6 setQuaternion, kinematic origin branch", () => {
        elements.makeKinematic(body);
        elements.setQuaternion({ uuid: "b", quaternion: QUAT });
        expect(fake.created.filter(i => i.__type === "btVector3").length).toBeGreaterThan(0);
        expect(fake.aliveTypes(...keep)).toEqual([]);
    });

    it("S6 resetElement", () => {
        elements.resetElement({ uuid: "b", position: POS, quaternion: QUAT });
        expect(fake.aliveTypes(...keep)).toEqual([]);
    });
});

describe("creation paths keep only the long-lived objects", () => {
    it("createRigidBody keeps only body, motion state and shape", () => {
        const shape = new Ammo.btSphereShape(1);
        const body = elements.createRigidBody(shape, { uuid: "x", mass: 1, friction: 1, ...base });

        expect(body.motionState).toBeDefined();
        expect(body.collisionShape).toBe(shape);
        expect(fake.aliveTypes()).toEqual(
            expect.arrayContaining(["btRigidBody", "btDefaultMotionState", "btSphereShape"]),
        );
        expect(fake.alive(body, body.motionState, shape)).toEqual([]);
    });

    it("addBox keeps only body, motion state and shape", () => {
        elements.addBox({ uuid: "b", width: 1, height: 2, length: 3, ...base });
        const { body } = world.getElement("b");

        expect(fake.alive(body, body.motionState, body.collisionShape)).toEqual([]);
    });

    it("addCompound keeps only body, motion state, compound and its leaf shapes", () => {
        elements.addCompound({
            uuid: "c",
            ...base,
            shapes: [
                { colliderType: COLLIDER_TYPES.BOX, childUuid: "c1" },
                { colliderType: COLLIDER_TYPES.SPHERE, childUuid: "c2" },
            ],
        });
        const { body } = world.getElement("c");

        expect(
            fake.alive(
                body,
                body.motionState,
                body.collisionShape,
                ...body.collisionShape.childShapes,
            ),
        ).toEqual([]);
    });
});

describe("S7 vehicle disposal", () => {
    it("S7 removes action and chassis, then destroys vehicle, tuning, raycaster, chassis, motion state and shape", () => {
        addVehicle({ uuid: "v", wheels: ["w1", "w2", "w3", "w4"], ...base });
        const element = world.getElement("v");
        expect(element.type).toBe(TYPES.VEHICLE);
        const { vehicle, chassis, tuning, rayCaster, motionState, shape } = element;

        world.disposeBody({ uuid: "v" });

        expect(world.dynamicsWorld.removeAction).toHaveBeenCalledWith(vehicle);
        expect(world.dynamicsWorld.removeRigidBody).toHaveBeenCalledWith(chassis);
        [vehicle, tuning, rayCaster, chassis, motionState, shape].forEach(i =>
            expect(fake.destroyed).toContain(i),
        );
        expect(eventIndex("removeAction", vehicle)).toBeLessThan(eventIndex("destroy", vehicle));
        expect(eventIndex("removeRigidBody", chassis)).toBeLessThan(eventIndex("destroy", chassis));
        expect(eventIndex("destroy", vehicle)).toBeLessThan(eventIndex("destroy", tuning));
        expect(eventIndex("destroy", vehicle)).toBeLessThan(eventIndex("destroy", rayCaster));
        expect(world.getElement("v")).toBeUndefined();
    });

    it("addVehicle keeps only the long-lived vehicle objects", () => {
        addVehicle({ uuid: "v", wheels: [], ...base });
        const { vehicle, chassis, tuning, rayCaster, motionState, shape } = world.getElement("v");

        expect(fake.alive(vehicle, chassis, tuning, rayCaster, motionState, shape)).toEqual([]);
    });

    it("setVehiclePosition, setVehicleQuaternion and resetVehicle leave no temporaries alive", () => {
        addVehicle({ uuid: "v", wheels: [], ...base });
        const { vehicle, chassis, tuning, rayCaster, motionState, shape } = world.getElement("v");
        const keep = [vehicle, chassis, tuning, rayCaster, motionState, shape];

        setVehiclePosition({ uuid: "v", position: POS });
        setVehicleQuaternion({ uuid: "v", quaternion: QUAT });
        resetVehicle({ uuid: "v", position: POS, quaternion: QUAT });

        expect(fake.alive(...keep)).toEqual([]);
    });
});

describe("effects destroy their temporaries", () => {
    it("createExplosion at a body leaves nothing alive but the body's own objects", () => {
        elements.addBox({ uuid: "b", width: 1, height: 1, length: 1, ...base });
        const { body } = world.getElement("b");

        createExplosion({ uuid: "b" });

        expect(fake.alive(body, body.motionState, body.collisionShape)).toEqual([]);
    });

    it("createExplosion at a caller-supplied position does not destroy that position", () => {
        const position = new Ammo.btVector3(0, 0, 0);

        createExplosion({ uuid: "none", position });

        expect(fake.destroyed).not.toContain(position);
        expect(fake.alive(position)).toEqual([]);
    });
});

describe("disposeBody edge cases", () => {
    it("is a no-op for an unknown uuid (warn, no throw)", () => {
        const warn = jest.spyOn(console, "warn").mockImplementation(() => {});

        expect(() => world.disposeBody({ uuid: "nope" })).not.toThrow();

        expect(warn).toHaveBeenCalled();
        expect(fake.destroyed).toHaveLength(0);
        expect(world.dynamicsWorld.removeRigidBody).not.toHaveBeenCalled();
        warn.mockRestore();
    });

    it("never destroys twice when disposed again", () => {
        const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
        elements.addBox({ uuid: "b", width: 1, height: 1, length: 1, ...base });

        world.disposeBody({ uuid: "b" });
        const count = fake.destroyed.length;
        world.disposeBody({ uuid: "b" });

        expect(fake.destroyed).toHaveLength(count);
        expect(new Set(fake.destroyed).size).toBe(count);
        warn.mockRestore();
    });

    const tick = () => {
        world.dynamicsWorld.stepSimulation = jest.fn();
        world.dynamicsWorld.getDispatcher = () => ({ getNumManifolds: () => 0 });
        world.maxSubSteps = 1;
        world.fixedTimeStep = 1 / 60;
        const realSetTimeout = global.setTimeout;
        global.setTimeout = jest.fn();
        try {
            world.simulate();
        } finally {
            global.setTimeout = realSetTimeout;
        }
    };

    it("the next simulate tick does not touch a disposed body", () => {
        elements.addSphere({ uuid: "s", radius: 1, mass: 1, ...base });
        const { body } = world.getElement("s");
        body.isStaticObject = jest.fn(() => false);

        world.disposeBody({ uuid: "s" });
        tick();

        expect(body.isStaticObject).not.toHaveBeenCalled();
        expect(dispatcher.sendBodyUpdate).not.toHaveBeenCalled();
    });

    it("simulate skips records that are only marked deleted", () => {
        elements.addSphere({ uuid: "s", radius: 1, mass: 1, ...base });
        const { body } = world.getElement("s");
        body.isStaticObject = jest.fn(() => false);

        world.removeElement("s");
        tick();

        expect(body.isStaticObject).not.toHaveBeenCalled();
        expect(world.hasElement("s")).toBe(false);
    });

    it("a DISPOSE followed by ADD with the same uuid works (refreshOwningBody)", () => {
        elements.addBox({ uuid: "b", width: 1, height: 1, length: 1, ...base });
        world.disposeBody({ uuid: "b" });
        elements.addBox({ uuid: "b", width: 1, height: 1, length: 1, ...base });

        expect(world.hasElement("b")).toBe(true);
        world.removeDeletedElements();
        expect(world.hasElement("b")).toBe(true);
    });
});
