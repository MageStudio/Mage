import dispatcher from "./lib/dispatcher";
import world from "./world";

import { applyMatrix4ToVector3 } from "./lib/math";

import {
    DEFAULT_RIGIDBODY_STATE,
    TYPES,
    COLLIDER_TYPES,
    DEFAULT_SCALE,
    DEFAULT_HULL_MAX_POINTS,
    COLLISION_FILTER_GROUPS,
    DISABLE_DEACTIVATION,
    CF_STATIC_OBJECT,
    CF_KINEMATIC_OBJECT,
    DEFAULT_LINEAR_VELOCITY,
    DEFAULT_IMPULSE,
} from "../constants";

// Turn a body into a kinematic one: it stays mass-0 (infinite mass to the
// solver) but is driven by its motionState transform rather than frozen like a
// static body. Bullet derives its linear/angular velocity from the per-step
// motionState delta and applies that to contacting dynamic bodies, so objects
// resting on it are carried along instead of falling through.
export const makeKinematic = body => {
    const flags = (body.getCollisionFlags() & ~CF_STATIC_OBJECT) | CF_KINEMATIC_OBJECT;
    body.setCollisionFlags(flags);
    body.setActivationState(DISABLE_DEACTIVATION);
    body.activate(true);
};

// Auto-promote a static body the first time it is moved/rotated by a script.
// A static body teleported via setWorldTransform reports zero velocity to the
// solver, so resting dynamic bodies lose their support contact (and can tunnel
// through a thin collider). Promoting to kinematic fixes both.
const ensureKinematic = body => {
    if (body.isStaticObject()) {
        makeKinematic(body);
    }
};

export const createRigidBody = (shape, options) => {
    const {
        uuid,
        position,
        quaternion,
        mass = 0,
        friction,
        restitution = 0.9,
        damping = { linear: 0.2, angular: 0.2 },
        kinematic = false,
        ccdRadius = 0,
        collisionEvents = false,
    } = options;

    const transform = new Ammo.btTransform();

    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));
    transform.setRotation(
        new Ammo.btQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w),
    );
    const motionState = new Ammo.btDefaultMotionState(transform);
    const localInertia = new Ammo.btVector3(0, 0, 0);
    shape.calculateLocalInertia(mass, localInertia);

    const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
    const body = new Ammo.btRigidBody(rbInfo);

    if (mass > 0) {
        body.setFriction(friction);
        body.setRestitution(restitution);
        body.setDamping(damping.linear, damping.angular);
        body.setActivationState(DISABLE_DEACTIVATION);
        // Continuous collision detection so a fast-moving dynamic body can't
        // tunnel through a thin collider — e.g. a sphere ejected by a rotating
        // kinematic platform. Mirrors the player capsule's CCD setup.
        if (ccdRadius > 0) {
            body.setCcdMotionThreshold(ccdRadius * 0.5);
            body.setCcdSweptSphereRadius(ccdRadius * 0.8);
        }
    } else if (kinematic) {
        // mass-0 body explicitly flagged as a movable (kinematic) collider.
        if (friction != null) body.setFriction(friction);
        makeKinematic(body);
    }

    // storing uuid for future reference
    body.uuid = uuid;

    // Authoritative position for kinematic bodies. Bullet extrapolates a
    // kinematic body's transform from its derived velocity; if we read that
    // back (getWorldTransform) when only changing rotation, the position drifts
    // and runs away. We instead pin the origin to this stored value.
    body.kinematicPosition = { x: position.x, y: position.y, z: position.z };

    // Bullet never pairs two non-dynamic bodies: addRigidBody(body) puts static
    // AND kinematic bodies in the STATIC filter group, whose mask excludes
    // STATIC, and needsCollision() additionally drops a pair where neither body
    // is active. So two mass-0 elements produce no manifold — no contacts, no
    // ELEMENT.COLLISION — whatever shape they have.
    //
    // `collisionEvents` opts a static body out of that: it joins the DEFAULT
    // group with an ALL mask and stays awake, so overlapping static pairs report
    // contacts. There is still no physical response (infinite mass on both
    // sides) — this buys collision EVENTS, which is the trigger/overlap
    // behaviour authors actually want here.
    if (collisionEvents && mass === 0 && !kinematic) {
        body.setActivationState(DISABLE_DEACTIVATION);
        world.addRigidBody(body, COLLISION_FILTER_GROUPS.DEFAULT, COLLISION_FILTER_GROUPS.ALL);
    } else {
        world.addRigidBody(body);
    }

    return body;
};

export const addModel = options => {
    const {
        uuid,
        vertices,
        matrices,
        indexes,
        position,
        quaternion,
        mass = 0,
        friction = 2,
    } = options;

    const scale = DEFAULT_SCALE;

    const bta = new Ammo.btVector3();
    const btb = new Ammo.btVector3();
    const btc = new Ammo.btVector3();
    const triMesh = new Ammo.btTriangleMesh(true, false);

    for (let i = 0; i < vertices.length; i++) {
        const components = vertices[i];
        const index = indexes[i] ? indexes[i] : null;
        const matrix = Array.from(matrices[i]);

        if (index) {
            for (let j = 0; j < index.length; j += 3) {
                const ai = index[j] * 3;
                const bi = index[j + 1] * 3;
                const ci = index[j + 2] * 3;

                const va = applyMatrix4ToVector3(
                    { x: components[ai], y: components[ai + 1], z: components[ai + 2] },
                    matrix,
                );
                const vb = applyMatrix4ToVector3(
                    { x: components[bi], y: components[bi + 1], z: components[bi + 2] },
                    matrix,
                );
                const vc = applyMatrix4ToVector3(
                    { x: components[ci], y: components[ci + 1], z: components[ci + 2] },
                    matrix,
                );

                bta.setValue(va.x, va.y, va.z);
                btb.setValue(vb.x, vb.y, vb.z);
                btc.setValue(vc.x, vc.y, vc.z);
                triMesh.addTriangle(bta, btb, btc, false);
            }
        } else {
            for (let j = 0; j < components.length; j += 9) {
                const va = applyMatrix4ToVector3(
                    { x: components[j + 0], y: components[j + 1], z: components[j + 2] },
                    matrix,
                );
                const vb = applyMatrix4ToVector3(
                    { x: components[j + 3], y: components[j + 4], z: components[j + 5] },
                    matrix,
                );
                const vc = applyMatrix4ToVector3(
                    { x: components[j + 6], y: components[j + 7], z: components[j + 8] },
                    matrix,
                );

                bta.setValue(va.x, va.y, va.z);
                btb.setValue(vb.x, vb.y, vb.z);
                btc.setValue(vc.x, vc.y, vc.z);
                triMesh.addTriangle(bta, btb, btc, false);
            }
        }
    }

    const localScale = new Ammo.btVector3(scale.x, scale.y, scale.z);
    triMesh.setScaling(localScale);
    Ammo.destroy(localScale);

    const collisionShape = new Ammo.btBvhTriangleMeshShape(triMesh, true, true);
    collisionShape.resources = [triMesh];

    Ammo.destroy(bta);
    Ammo.destroy(btb);
    Ammo.destroy(btc);

    const body = createRigidBody(collisionShape, { uuid, position, quaternion, mass, friction });
    world.addElement({ uuid, body, type: TYPES.MESH, state: DEFAULT_RIGIDBODY_STATE });
};

export const addBox = data => {
    const {
        uuid,
        width,
        length,
        height,
        position,
        quaternion,
        mass = 0,
        friction = 2,
        kinematic = false,
        collisionEvents = false,
    } = data;

    const geometry = new Ammo.btBoxShape(
        new Ammo.btVector3(width * 0.5, height * 0.5, length * 0.5),
    );
    const body = createRigidBody(geometry, {
        uuid,
        position,
        quaternion,
        mass,
        friction,
        kinematic,
        collisionEvents,
        // size CCD from the thinnest half-extent
        ccdRadius: Math.min(width, height, length) * 0.5,
    });

    world.addElement({ uuid, body, type: TYPES.BOX, state: DEFAULT_RIGIDBODY_STATE });
};

export const addSphere = data => {
    const {
        uuid,
        radius,
        position,
        quaternion,
        mass = 0,
        friction = 2,
        kinematic = false,
        collisionEvents = false,
    } = data;

    const geometry = new Ammo.btSphereShape(radius);
    const body = createRigidBody(geometry, {
        uuid,
        position,
        quaternion,
        mass,
        friction,
        kinematic,
        collisionEvents,
        ccdRadius: radius,
    });

    world.addElement({ uuid, body, type: TYPES.SPHERE, state: DEFAULT_RIGIDBODY_STATE });
};

// Build the leaf Ammo shape for one collider of a compound body. Mirrors the
// shape construction in addBox/addSphere so a compound child collides exactly
// like the equivalent standalone element would.
// Build a convex hull from the flat [x, y, z, ...] list computed on the main
// thread. Those points are already QuickHull output — the mesh's extreme
// vertices only — so this adds them verbatim rather than re-reducing them.
const createHullShape = points => {
    const hull = new Ammo.btConvexHullShape();
    const vertex = new Ammo.btVector3();
    const count = Math.floor(points.length / 3);

    for (let i = 0; i < count; i++) {
        vertex.setValue(points[i * 3], points[i * 3 + 1], points[i * 3 + 2]);
        // Recalculating the local AABB is O(n); only do it on the final point.
        hull.addPoint(vertex, i === count - 1);
    }
    Ammo.destroy(vertex);

    if (count > DEFAULT_HULL_MAX_POINTS) {
        // Convex-vs-convex narrowphase is linear in vertex count, so this is a
        // performance warning, not a correctness one — the shape is still valid.
        console.warn(
            `[Mage] Physics: hull built from ${count} vertices (over ${DEFAULT_HULL_MAX_POINTS}) — consider a simplified collision mesh for this model`,
        );
    } else {
        // SAT-based polyhedral contact clipping rather than GJK/EPA point
        // contacts: markedly steadier resting contacts for the flat-faced shapes
        // most props reduce to. Skipped above the cap, where the precompute
        // costs more than it returns.
        hull.initializePolyhedralFeatures(0);
    }

    return hull;
};

const createLeafShape = ({
    colliderType,
    width = 1,
    height = 1,
    length = 1,
    radius = 0.5,
    points,
}) => {
    // A hull needs at least a tetrahedron's worth of coordinates; the main
    // thread already degrades to BOX when it can't produce that, so this is a
    // belt-and-braces guard against a malformed message.
    if (colliderType === COLLIDER_TYPES.HULL && points && points.length >= 12) {
        return createHullShape(points);
    }
    if (colliderType === COLLIDER_TYPES.SPHERE) {
        return new Ammo.btSphereShape(radius);
    }
    return new Ammo.btBoxShape(new Ammo.btVector3(width * 0.5, height * 0.5, length * 0.5));
};

// Descriptor kept per child shape so calculateCollisions can resolve which
// child of the compound a contact belongs to (see world.resolveChildUuid). We
// store the child's local placement + half-extents/radius so a contact's local
// point can be tested against each child region.
const makeChildDescriptor = (shape, index) => ({
    index,
    uuid: shape.childUuid,
    colliderType: shape.colliderType,
    localPosition: shape.localPosition || { x: 0, y: 0, z: 0 },
    localQuaternion: shape.localQuaternion || { x: 0, y: 0, z: 0, w: 1 },
    halfExtents: {
        x: (shape.width || 1) * 0.5,
        y: (shape.height || 1) * 0.5,
        z: (shape.length || 1) * 0.5,
    },
    radius: shape.radius || 0.5,
});

// Realize a parent element and its rigidly-attached children as ONE rigid body
// backed by a btCompoundShape. shapes[0] is the parent (root) collider at local
// identity; the rest are children at their parent-relative transforms. Rotating
// the single body rotates every child collider for free — no per-frame sync.
export const addCompound = data => {
    const {
        uuid,
        position,
        quaternion,
        mass = 0,
        friction = 2,
        kinematic = false,
        collisionEvents = false,
        ccdRadius = 0,
        shapes = [],
    } = data;

    const compound = new Ammo.btCompoundShape();
    const childMap = [];

    shapes.forEach((shape, index) => {
        const leaf = createLeafShape(shape);

        const localTransform = new Ammo.btTransform();
        localTransform.setIdentity();
        const lp = shape.localPosition || { x: 0, y: 0, z: 0 };
        const lq = shape.localQuaternion || { x: 0, y: 0, z: 0, w: 1 };
        localTransform.setOrigin(new Ammo.btVector3(lp.x, lp.y, lp.z));
        localTransform.setRotation(new Ammo.btQuaternion(lq.x, lq.y, lq.z, lq.w));

        compound.addChildShape(localTransform, leaf);
        Ammo.destroy(localTransform);

        childMap.push(makeChildDescriptor(shape, index));
    });

    const body = createRigidBody(compound, {
        uuid,
        position,
        quaternion,
        mass,
        friction,
        kinematic,
        collisionEvents,
        ccdRadius,
    });

    world.addElement({
        uuid,
        body,
        type: TYPES.COMPOUND,
        state: DEFAULT_RIGIDBODY_STATE,
        childMap,
    });
};

export const setLinearVelocity = data => {
    const { uuid, velocity = DEFAULT_LINEAR_VELOCITY } = data;
    const { body } = world.getElement(uuid);
    const motionState = body.getMotionState();

    if (motionState) {
        const linearVelocity = new Ammo.btVector3(velocity.x, velocity.y, velocity.z);
        body.setLinearVelocity(linearVelocity);
        Ammo.destroy(linearVelocity);
    }
};

export const setPosition = data => {
    const { uuid, position } = data;
    const { body } = world.getElement(uuid);

    // A script is moving this collider — promote it from static to kinematic so
    // it carries resting bodies and doesn't let them tunnel through.
    ensureKinematic(body);

    // This is the new authoritative position for the kinematic body.
    body.kinematicPosition = { x: position.x, y: position.y, z: position.z };

    const transform = new Ammo.btTransform();

    body.getWorldTransform(transform);
    transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));

    body.setWorldTransform(transform);
    // Also update motion state so static bodies (mass=0) reflect the change
    const motionState = body.getMotionState();
    if (motionState) {
        motionState.setWorldTransform(transform);
    }
};

export const resetElement = data => {
    const { uuid, position, quaternion } = data;
    const { body } = world.getElement(uuid);

    const transform = new Ammo.btTransform();

    body.getWorldTransform(transform);
    transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));
    transform.setRotation(
        new Ammo.btQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w),
    );

    body.setWorldTransform(transform);
    // Also update motion state so static bodies (mass=0) reflect the change
    const motionState = body.getMotionState();
    if (motionState) {
        motionState.setWorldTransform(transform);
    }
};

export const applyImpuse = ({ uuid, impulse = DEFAULT_IMPULSE }) => {
    try {
        const element = world.getElement(uuid);
        if (!element) {
            console.warn("[Physics Worker] applyImpulse: element not found for uuid:", uuid);
            return;
        }
        const { body } = element;
        if (!body) {
            console.warn("[Physics Worker] applyImpulse: body is null for uuid:", uuid);
            return;
        }

        body.activate(true);

        const btImpulse = new Ammo.btVector3(impulse.x, impulse.y, impulse.z);
        body.applyCentralImpulse(btImpulse);
        Ammo.destroy(btImpulse);
    } catch (e) {
        console.error("[Physics Worker] applyImpulse error:", e);
    }
};

export const setQuaternion = data => {
    const { uuid, quaternion } = data;
    const { body } = world.getElement(uuid);

    // A script is rotating this collider — promote it from static to kinematic
    // so it carries resting bodies and doesn't let them tunnel through.
    ensureKinematic(body);

    const transform = new Ammo.btTransform();
    body.getWorldTransform(transform);

    // Pin the origin to the authoritative kinematic position rather than
    // preserving whatever Bullet extrapolated into the world transform. A
    // kinematic body driven only by rotation must not accumulate positional
    // drift — reading getWorldTransform back here is what let the platform slide
    // off and blow up. Fall back to the current origin if we have no stored
    // position (e.g. a dynamic body being oriented explicitly).
    const kp = body.kinematicPosition;
    if (kp && (body.getCollisionFlags() & CF_KINEMATIC_OBJECT) !== 0) {
        transform.setOrigin(new Ammo.btVector3(kp.x, kp.y, kp.z));
    }

    transform.setRotation(
        new Ammo.btQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w),
    );
    body.setWorldTransform(transform);
    // Also update motion state so static bodies (mass=0) reflect the change
    const motionState = body.getMotionState();
    if (motionState) {
        motionState.setWorldTransform(transform);
    }
};

export const handleElementUpdate = (
    { body, uuid, state: _state = DEFAULT_RIGIDBODY_STATE },
    dt,
) => {
    // Static bodies (mass=0) never move — skip sending updates so the
    // visual position stays exactly where the author placed it.
    if (body.isStaticObject()) return;

    const motionState = body.getMotionState();

    if (motionState) {
        const transform = new Ammo.btTransform();

        motionState.getWorldTransform(transform);
        let origin = transform.getOrigin();
        let rotation = transform.getRotation();

        dispatcher.sendBodyUpdate(uuid, origin, rotation, dt);
        Ammo.destroy(transform);
    }
};
