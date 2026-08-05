import { COLLIDER_TYPES, COLLISION_FILTER_GROUPS, DISABLE_DEACTIVATION } from "../../constants";

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
import { addCompound, createRigidBody } from "../elements";

// Unit cube corners — the shape extractHullPoints produces for a box mesh.
const CUBE_POINTS = [
    1, 1, 1, 1, 1, -1, 1, -1, 1, 1, -1, -1, -1, 1, 1, -1, 1, -1, -1, -1, 1, -1, -1, -1,
];

const BASE = {
    uuid: "compound",
    position: { x: 0, y: 0, z: 0 },
    quaternion: { x: 0, y: 0, z: 0, w: 1 },
};

const hullShape = (overrides = {}) => ({
    childUuid: "hull-child",
    colliderType: COLLIDER_TYPES.MODEL_SHAPE,
    points: CUBE_POINTS,
    width: 2,
    height: 2,
    length: 2,
    localPosition: { x: 0, y: 0, z: 0 },
    localQuaternion: { x: 0, y: 0, z: 0, w: 1 },
    ...overrides,
});

let hulls;
let boxes;
let compound;
let body;

const installAmmo = () => {
    hulls = [];
    boxes = [];
    compound = { addChildShape: jest.fn(), calculateLocalInertia: jest.fn() };
    body = {
        setActivationState: jest.fn(),
        activate: jest.fn(),
        setCollisionFlags: jest.fn(),
        getCollisionFlags: jest.fn(() => 1),
        setFriction: jest.fn(),
        setRestitution: jest.fn(),
        setDamping: jest.fn(),
        setCcdMotionThreshold: jest.fn(),
        setCcdSweptSphereRadius: jest.fn(),
        isStaticObject: jest.fn(() => true),
    };

    global.Ammo = {
        btConvexHullShape: function () {
            const hull = {
                points: [],
                addPoint: jest.fn(function (vector, recalculate) {
                    hull.points.push({ ...vector.value, recalculate });
                }),
                initializePolyhedralFeatures: jest.fn(),
                calculateLocalInertia: jest.fn(),
            };
            hulls.push(hull);
            return hull;
        },
        btBoxShape: function () {
            const box = { calculateLocalInertia: jest.fn() };
            boxes.push(box);
            return box;
        },
        btSphereShape: function () {
            return { calculateLocalInertia: jest.fn() };
        },
        btCompoundShape: function () {
            return compound;
        },
        btVector3: function (x = 0, y = 0, z = 0) {
            return {
                value: { x, y, z },
                setValue(nx, ny, nz) {
                    this.value = { x: nx, y: ny, z: nz };
                },
            };
        },
        btQuaternion: function () {},
        btTransform: function () {
            return { setIdentity: jest.fn(), setOrigin: jest.fn(), setRotation: jest.fn() };
        },
        btDefaultMotionState: function () {},
        btRigidBodyConstructionInfo: function () {},
        btRigidBody: function () {
            return body;
        },
        destroy: jest.fn(),
    };
};

beforeEach(installAmmo);

afterEach(() => {
    delete global.Ammo;
    jest.clearAllMocks();
});

describe("hull compound leaves", () => {
    it("builds a btConvexHullShape from the supplied points", () => {
        addCompound({ ...BASE, shapes: [hullShape()] });

        expect(hulls).toHaveLength(1);
        expect(boxes).toHaveLength(0);
        expect(hulls[0].addPoint).toHaveBeenCalledTimes(8);
        expect(hulls[0].points[0]).toMatchObject({ x: 1, y: 1, z: 1 });
    });

    it("recalculates the local AABB only on the final point", () => {
        addCompound({ ...BASE, shapes: [hullShape()] });

        const recalculations = hulls[0].points.map(point => point.recalculate);
        expect(recalculations.slice(0, -1).every(flag => flag === false)).toBe(true);
        expect(recalculations[recalculations.length - 1]).toBe(true);
    });

    it("enables polyhedral contact clipping for hulls within the vertex cap", () => {
        addCompound({ ...BASE, shapes: [hullShape()] });

        expect(hulls[0].initializePolyhedralFeatures).toHaveBeenCalledWith(0);
    });

    it("mixes hull and box leaves in one compound", () => {
        addCompound({
            ...BASE,
            shapes: [
                hullShape(),
                { ...hullShape({ childUuid: "box-child" }), colliderType: COLLIDER_TYPES.BOX },
            ],
        });

        expect(hulls).toHaveLength(1);
        expect(boxes).toHaveLength(1);
        expect(compound.addChildShape).toHaveBeenCalledTimes(2);
    });

    it("degrades to a box when the points are missing or too few", () => {
        addCompound({ ...BASE, shapes: [hullShape({ points: [1, 1, 1] })] });

        expect(hulls).toHaveLength(0);
        expect(boxes).toHaveLength(1);
    });
});

describe("collisionEvents filter groups", () => {
    const options = {
        uuid: "x",
        position: { x: 0, y: 0, z: 0 },
        quaternion: { x: 0, y: 0, z: 0, w: 1 },
    };

    it("puts an opted-in static body in the DEFAULT group so static pairs report contacts", () => {
        createRigidBody(new Ammo.btBoxShape(), { ...options, mass: 0, collisionEvents: true });

        expect(body.setActivationState).toHaveBeenCalledWith(DISABLE_DEACTIVATION);
        expect(world.addRigidBody).toHaveBeenCalledWith(
            body,
            COLLISION_FILTER_GROUPS.DEFAULT,
            COLLISION_FILTER_GROUPS.ALL,
        );
    });

    it("leaves Bullet's implicit groups alone when the flag is absent", () => {
        createRigidBody(new Ammo.btBoxShape(), { ...options, mass: 0 });

        expect(world.addRigidBody).toHaveBeenCalledWith(body);
    });

    it("does not override the groups for a dynamic body, which already pairs", () => {
        createRigidBody(new Ammo.btBoxShape(), { ...options, mass: 5, collisionEvents: true });

        expect(world.addRigidBody).toHaveBeenCalledWith(body);
    });

    it("does not override the groups for a kinematic body", () => {
        createRigidBody(new Ammo.btBoxShape(), {
            ...options,
            mass: 0,
            kinematic: true,
            collisionEvents: true,
        });

        expect(world.addRigidBody).toHaveBeenCalledWith(body);
    });
});
