export const LIBRARY_NAME = "ammo.js";

export const TYPES = {
    BOX: "BOX",
    SPHERE: "SPHERE",
    VEHICLE: "VEHICLE",
    MESH: "MESH",
    PLAYER: "PLAYER",
    // A single rigid body whose shape is a btCompoundShape made of a parent
    // element's collider plus its rigidly-attached (scene-graph child) colliders.
    COMPOUND: "COMPOUND",
};

export const COLLIDER_TYPES = {
    BOX: "BOX",
    VEHICLE: "VEHICLE",
    PLAYER: "PLAYER",
    SPHERE: "SPHERE",
    // Convex hull wrapped around the element's own geometry — "Model Shape" in
    // the editor. The only shape that collides with everything (boxes, spheres,
    // players, other hulls) AND can be dynamic or a compound leaf, so it is the
    // collider imported models want.
    //
    // Convex, so concave detail is lost: it fills in arches and doorways, and
    // reduces a staircase to a ramp. Implementation names below stay "hull" —
    // that is what it is; MODEL_SHAPE is the vocabulary authors see.
    MODEL_SHAPE: "MODEL_SHAPE",
    // No collider of its own. Valid only inside a compound: the element still
    // acts as the rigid frame its physics-enabled descendants weld to, but
    // contributes no shape (e.g. a grouping/holder parent).
    NONE: "NONE",
};

// Upper bound on the vertices of a single hull. Convex-vs-convex narrowphase is
// linear in vertex count, so an unreduced 5k-vertex hull is a performance bug.
// Bullet's btShapeHull reduces to this in the worker.
export const DEFAULT_HULL_MAX_POINTS = 64;

// btBroadphaseProxy::CollisionFilterGroups. Bullet assigns these implicitly in
// addRigidBody(body): dynamic bodies get DEFAULT/ALL, while static AND kinematic
// bodies get STATIC with a mask that excludes STATIC — which is why two mass-0
// bodies never generate a contact manifold, however they are shaped. Passing the
// groups explicitly lets a static body opt into being paired anyway.
export const COLLISION_FILTER_GROUPS = {
    DEFAULT: 1,
    STATIC: 2,
    KINEMATIC: 4,
    ALL: -1,
};

export const DEFAULT_VEHICLE_STATE = {
    vehicleSteering: 0,
    acceleration: false,
    breaking: false,
    right: false,
    left: false,
};

export const DEFAULT_RIGIDBODY_STATE = {
    velocity: { x: 0, y: 0, z: 0 },
    movement: {
        forward: false,
        backwards: false,
        left: false,
        right: false,
    },
    direction: {
        x: 0,
        y: 0,
        z: 0,
    },
};

export const DEFAULT_SCALE = { x: 1, y: 1, z: 1 };
export const DEFAULT_QUATERNION = { x: 0, y: 0, z: 0, w: 1 };
export const DEFAULT_POSITION = { x: 0, y: 0, z: 0 };
export const DEFAULT_LINEAR_VELOCITY = { x: 0, y: 0, z: 0 };
export const DEFAULT_ANGULAR_VELOCITY = { x: 0, y: 0, z: 0 };
export const DEFAULT_IMPULSE = { x: 0, y: 0, z: 0 };

export const DISABLE_DEACTIVATION = 4;

// Bullet btCollisionObject::CollisionFlags
export const CF_STATIC_OBJECT = 1;
export const CF_KINEMATIC_OBJECT = 2;

export const GRAVITY = { x: 0, y: -30, z: 0 };

export const FRONT_LEFT = 0;
export const FRONT_RIGHT = 1;
export const BACK_LEFT = 2;
export const BACK_RIGHT = 3;

export const DEFAULT_STEERING_INCREMENT = 0.04;
export const DEFAULT_STEERING_CLAMP = 0.5;
export const DEFAULT_MAX_ENGINE_FORCE = 2000;
export const DEFAULT_MAX_BREAKING_FORCE = 100;

export const EXPLOSION_SIZES = {
    SMALL: 4,
    MEDIUM: 6,
    LARGE: 8,
    MASSIVE: 12,
};

export const EXPLOSION_STRENGTHS = {
    VERY_WEAK: 2,
    WEAK: 4,
    MEDIUM: 8,
    LARGE: 16,
    MASSIVE: 32,
    OK_NO: 64,
};
