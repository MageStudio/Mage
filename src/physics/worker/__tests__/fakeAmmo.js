import { CF_STATIC_OBJECT } from "../../constants";

// Fake Ammo whose constructors record each instance and whose `destroy`
// records each destroyed instance. Instances are Proxies: any method not
// modelled explicitly is a no-op jest.fn, so worker code can drive them freely.
// Getters that return references into Bullet memory (getOrigin, getRotation,
// getMotionState, getCollisionShape) hand back objects that are NOT recorded as
// created, mirroring real Ammo, where destroying them would be a bug.
const TYPES = [
    "btVector3",
    "btQuaternion",
    "btTransform",
    "btDefaultMotionState",
    "btRigidBodyConstructionInfo",
    "btRigidBody",
    "btBoxShape",
    "btSphereShape",
    "btCapsuleShape",
    "btCompoundShape",
    "btConvexHullShape",
    "btBvhTriangleMeshShape",
    "btTriangleMesh",
    "btVehicleTuning",
    "btDefaultVehicleRaycaster",
    "btRaycastVehicle",
    "btGhostObject",
];

// Method-like names become no-op jest.fns; data fields (childShapes, resources,
// motionState, ...) stay undefined until the code under test sets them.
const METHOD =
    /^(get|set|add|remove|calculate|is|apply|activate|update|initialize|add|perform|step|clear|reset|x$|y$|z$|w$)/;

// A reference returned by a getter: every method is a no-op, never recorded.
const looseRef = () =>
    new Proxy(
        { __reference: true },
        {
            get: (t, prop) => (prop in t || typeof prop === "symbol" ? t[prop] : jest.fn()),
        },
    );

export const createFakeAmmo = () => {
    const created = [];
    const destroyed = [];

    const modelled = (type, target) => {
        const args = target.__args;
        switch (type) {
            case "btRigidBody": {
                const rbInfo = args[0];
                let flags = rbInfo.__args[0] === 0 ? CF_STATIC_OBJECT : 0;
                return {
                    getMotionState: () => rbInfo.__args[1],
                    getCollisionShape: () => ({ __reference: true }),
                    getCollisionFlags: () => flags,
                    setCollisionFlags: f => {
                        flags = f;
                    },
                    isStaticObject: () => (flags & CF_STATIC_OBJECT) !== 0,
                    getWorldTransform: () => looseRef(),
                };
            }
            case "btTransform":
                return {
                    getOrigin: () => ({ __reference: true, x: () => 0, y: () => 0, z: () => 0 }),
                    getRotation: () => ({ __reference: true }),
                };
            case "btRaycastVehicle":
                return { getRigidBody: () => args[1], addWheel: () => looseRef() };
            default:
                return {};
        }
    };

    const make = (type, args) => {
        const target = { __type: type, __args: args };
        Object.assign(target, modelled(type, target));
        const fns = {};
        const proxy = new Proxy(target, {
            get(t, prop) {
                if (prop in t || typeof prop === "symbol" || !METHOD.test(prop)) return t[prop];
                if (!fns[prop]) fns[prop] = jest.fn();
                return fns[prop];
            },
        });
        created.push(proxy);
        return proxy;
    };

    const Ammo = {
        destroy: jest.fn(instance => {
            destroyed.push(instance);
        }),
        castObject: obj => obj,
    };
    TYPES.forEach(type => {
        Ammo[type] = function (...args) {
            return make(type, args);
        };
    });

    return {
        Ammo,
        created,
        destroyed,
        // instances created but never destroyed, minus the ones the test expects to stay
        alive: (...keep) => created.filter(i => !destroyed.includes(i) && !keep.includes(i)),
        aliveTypes: (...keep) =>
            created.filter(i => !destroyed.includes(i) && !keep.includes(i)).map(i => i.__type),
    };
};
