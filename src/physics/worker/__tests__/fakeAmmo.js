// Fake Ammo for leak tests. Every `new Ammo.btX(...)` is recorded in `live`
// and removed again by `Ammo.destroy`, so a test can assert exactly which
// objects survive a call. Objects returned by getters are NOT recorded (like
// real Ammo, they are references into Bullet memory and must not be destroyed).
const METHOD = /^(get|set|is|add|calculate|apply|activate|initialize|perform|remove|[xyzw]$)/;

const wrap = (target, extra = {}) =>
    new Proxy(target, {
        get(obj, prop) {
            if (prop in obj) return obj[prop];
            if (prop in extra) return extra[prop];
            if (typeof prop === "string" && METHOD.test(prop)) {
                obj[prop] = jest.fn(() => 0);
                return obj[prop];
            }
            return undefined;
        },
    });

// A getter result: a reference into Bullet memory, never recorded.
export const reference = () =>
    wrap({}, { x: () => 0, y: () => 0, z: () => 0, w: () => 1, getOrigin: () => reference() });

export const installFakeAmmo = () => {
    const live = new Set();
    const log = [];
    const doubleDestroyed = [];
    const Ammo = { live, log, doubleDestroyed };

    const track = (type, init) =>
        function (...args) {
            const target = { __type: type, __args: args };
            if (init) init(target, args);
            const instance = wrap(target, {
                getOrigin: () => reference(),
                getRotation: () => reference(),
                getMotionState: () => reference(),
                getWorldTransform: () => reference(),
            });
            live.add(instance);
            log.push(`new:${type}`);
            return instance;
        };

    [
        "btTransform",
        "btVector3",
        "btQuaternion",
        "btDefaultMotionState",
        "btRigidBodyConstructionInfo",
        "btBoxShape",
        "btSphereShape",
        "btCapsuleShape",
        "btConvexHullShape",
        "btCompoundShape",
        "btTriangleMesh",
        "btBvhTriangleMeshShape",
        "btVehicleTuning",
        "btDefaultVehicleRaycaster",
        "btRaycastVehicle",
        "btGhostObject",
    ].forEach(type => {
        Ammo[type] = track(type);
    });

    Ammo.btRigidBodyConstructionInfo = track("btRigidBodyConstructionInfo", (t, args) => {
        t.mass = args[0];
    });

    Ammo.btRigidBody = track("btRigidBody", (t, args) => {
        let flags = args[0].mass === 0 ? 1 : 0;
        t.getCollisionFlags = () => flags;
        t.setCollisionFlags = f => {
            flags = f;
        };
        t.isStaticObject = () => (flags & 1) !== 0;
    });

    Ammo.btRaycastVehicle = track("btRaycastVehicle", t => {
        t.addWheel = () => reference();
        t.getRigidBody = () => reference();
    });

    Ammo.destroy = obj => {
        if (!live.has(obj)) {
            doubleDestroyed.push(obj && obj.__type);
            return;
        }
        live.delete(obj);
        log.push(`destroy:${obj.__type}`);
    };

    Ammo.liveTypes = () => [...live].map(o => o.__type).sort();

    global.Ammo = Ammo;
    return Ammo;
};

// A dynamics world stand-in that records the order of removals in `log`.
export const makeDynamicsWorld = log => {
    const target = {};
    ["removeRigidBody", "removeAction", "removeCollisionObject"].forEach(name => {
        target[name] = jest.fn(() => {
            log.push(name);
        });
    });
    return wrap(target);
};
