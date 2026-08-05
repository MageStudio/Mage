import { GRAVITY, TYPES, COLLIDER_TYPES } from "../constants";

import { handleElementUpdate } from "./elements";
import { handleVehicleUpdate } from "./vehicles";
import { handlePlayerUpdate } from "./player";

import dispatcher from "./lib/dispatcher";
import { PHYSICS_EVENTS } from "../messages";

const requestNextFrame =
    self.requestAnimationFrame ||
    self.webkitRequestAnimationFrame ||
    self.mozRequestAnimationFrame ||
    self.oRequestAnimationFrame ||
    self.msRequestAnimationFrame ||
    function (callback, _element) {
        self.setTimeout(callback, 1000 / 120);
    };
class Clock {
    constructor() {
        this.timestamp = null;
    }

    getDelta() {
        const time = Date.now();
        if (this.timestamp) {
            const delta = time - this.timestamp;
            this.timestamp = time;

            return delta;
        } else {
            this.timestamp = time;

            return 0;
        }
    }
}
// Rotate a plain vector by the inverse (conjugate, for a unit quaternion) of q.
// Used to bring a body-local contact point into a compound child's own frame.
const rotateByInverseQuaternion = (v, q) => {
    const cx = -q.x;
    const cy = -q.y;
    const cz = -q.z;
    const cw = q.w;
    // t = 2 * cross(c.xyz, v)
    const tx = 2 * (cy * v.z - cz * v.y);
    const ty = 2 * (cz * v.x - cx * v.z);
    const tz = 2 * (cx * v.y - cy * v.x);
    // v' = v + cw * t + cross(c.xyz, t)
    return {
        x: v.x + cw * tx + (cy * tz - cz * ty),
        y: v.y + cw * ty + (cz * tx - cx * tz),
        z: v.z + cw * tz + (cx * ty - cy * tx),
    };
};

// Signed distance from a body-local point to one compound child's region:
// negative inside, ~0 on the surface, positive outside.
const signedDistanceToChild = (localPoint, child) => {
    const rel = {
        x: localPoint.x - child.localPosition.x,
        y: localPoint.y - child.localPosition.y,
        z: localPoint.z - child.localPosition.z,
    };
    const d = rotateByInverseQuaternion(rel, child.localQuaternion);

    if (child.colliderType === COLLIDER_TYPES.SPHERE) {
        return Math.sqrt(d.x * d.x + d.y * d.y + d.z * d.z) - child.radius;
    }

    const qx = Math.abs(d.x) - child.halfExtents.x;
    const qy = Math.abs(d.y) - child.halfExtents.y;
    const qz = Math.abs(d.z) - child.halfExtents.z;
    const ox = Math.max(qx, 0);
    const oy = Math.max(qy, 0);
    const oz = Math.max(qz, 0);
    const outside = Math.sqrt(ox * ox + oy * oy + oz * oz);
    const inside = Math.min(Math.max(qx, qy, qz), 0);
    return outside + inside;
};

// Resolve which element uuid a contact belongs to. Plain bodies (no childMap)
// resolve to their own uuid — a no-op that keeps existing behaviour. Compound
// bodies pick the child whose region the body-local contact point falls in (or
// is closest to), so per-child OnCollision/applyImpulse still fire. `localPoint`
// is an Ammo btVector3 (accessed via .x()/.y()/.z()).
export const resolveChildUuid = (element, localPoint) => {
    if (!element) return undefined;
    const { childMap, uuid } = element;
    if (!childMap || childMap.length === 0) return uuid;
    if (childMap.length === 1) return childMap[0].uuid;

    const point = { x: localPoint.x(), y: localPoint.y(), z: localPoint.z() };
    let best = childMap[0];
    let bestDist = Infinity;
    for (let k = 0; k < childMap.length; k++) {
        const dist = signedDistanceToChild(point, childMap[k]);
        if (dist < bestDist) {
            bestDist = dist;
            best = childMap[k];
        }
    }
    return best.uuid;
};

export class World {
    constructor() {
        this.elements = {};
        this.initialised = false;

        this.collisionConfiguration = undefined;
        this.dispatcher = undefined;
        this.broadphase = undefined;
        this.solver = undefined;
        this.dynamicsWorld = undefined;

        this.requestAnimationFrameId = null;
        this.clock = new Clock();
    }

    init = options => {
        const { gravity = GRAVITY, fixedTimeStep = 1 / 60, maxSubSteps = 3 } = options;

        this.fixedTimeStep = fixedTimeStep;
        this.maxSubSteps = maxSubSteps;

        this.collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
        this.dispatcher = new Ammo.btCollisionDispatcher(this.collisionConfiguration);
        this.broadphase = new Ammo.btDbvtBroadphase();
        this.solver = new Ammo.btSequentialImpulseConstraintSolver();
        this.dynamicsWorld = new Ammo.btDiscreteDynamicsWorld(
            this.dispatcher,
            this.broadphase,
            this.solver,
            this.collisionConfiguration,
        );
        this.dynamicsWorld.setGravity(new Ammo.btVector3(gravity.x, gravity.y, gravity.z));

        // Harden the solver against deep-penetration blow-ups: split impulse
        // separates positional correction from velocity so recovering from a
        // deep overlap (e.g. a thin kinematic platform rotating into a large
        // resting sphere under strong gravity) doesn't inject huge velocities.
        // More iterations converge stiff contacts under high gravity.
        const solverInfo = this.dynamicsWorld.getSolverInfo();
        solverInfo.set_m_splitImpulse(true);
        solverInfo.set_m_splitImpulsePenetrationThreshold(-0.02);
        solverInfo.set_m_numIterations(20);

        // this is needed for ghostObject collisions
        this.dynamicsWorld
            .getBroadphase()
            .getOverlappingPairCache()
            .setInternalGhostPairCallback(new Ammo.btGhostPairCallback());

        this.initialised = true;
    };

    removeElement = uuid => {
        if (this.hasElement(uuid)) {
            this.elements[uuid].deleted = true;
        }
    };

    removeDeletedElements = () =>
        Object.keys(this.elements)
            .filter(uuid => this.elements[uuid].deleted)
            .forEach(uuid => {
                delete this.elements[uuid];
            });

    hasElement = uuid => {
        return Object.keys(this.elements).includes(uuid);
    };

    getElement = uuid => this.elements[uuid];

    isInitialised = () => this.initialised;

    getDynamicsWorld = () => this.dynamicsWorld;

    // `group`/`mask` are optional: omitting them keeps Bullet's implicit
    // assignment (DEFAULT/ALL for dynamic bodies, STATIC/~STATIC for static and
    // kinematic ones). Pass them to override that — see the collisionEvents
    // handling in createRigidBody.
    addRigidBody = (body, group, mask) => {
        if (group === undefined || mask === undefined) {
            this.dynamicsWorld.addRigidBody(body);
            return;
        }
        this.dynamicsWorld.addRigidBody(body, group, mask);
    };

    addAction = action => {
        this.dynamicsWorld.addAction(action);
    };

    addCollisionObject = collisionObject => {
        this.dynamicsWorld.addCollisionObject(collisionObject);
    };

    stepSimulation = dt => {
        this.dynamicsWorld.stepSimulation(dt, this.maxSubSteps, this.fixedTimeStep);
    };

    simulate = () => {
        const dt = this.clock.getDelta() / 1000;
        this.stepSimulation(dt);

        Object.keys(this.elements).forEach(uuid => {
            const element = this.getElement(uuid);

            if (element) {
                switch (element.type) {
                    case TYPES.BOX:
                    case TYPES.SPHERE:
                    case TYPES.MESH:
                    case TYPES.COMPOUND:
                        handleElementUpdate(element, dt);
                        break;
                    case TYPES.PLAYER:
                        handlePlayerUpdate(element, dt);
                        break;
                    case TYPES.VEHICLE:
                        handleVehicleUpdate(element, dt);
                        break;
                    default:
                        break;
                }
            }
        });

        this.calculateCollisions();
        this.removeDeletedElements();

        dispatcher.sendPhysicsUpdate(dt);

        this.requestAnimationFrameId = requestNextFrame(this.simulate.bind(this));
    };

    calculateCollisions = () => {
        let ammoDispatcher = this.dynamicsWorld.getDispatcher();
        let numManifolds = ammoDispatcher.getNumManifolds();

        for (let i = 0; i < numManifolds; i++) {
            let contactManifold = ammoDispatcher.getManifoldByIndexInternal(i);

            let rb0 = Ammo.castObject(contactManifold.getBody0(), Ammo.btRigidBody);
            let rb1 = Ammo.castObject(contactManifold.getBody1(), Ammo.btRigidBody);

            let numContacts = contactManifold.getNumContacts();

            // this iteration doesn't have uuids
            if (!rb0.uuid || !rb1.uuid) continue;

            // For compound bodies these carry a childMap; for plain bodies the
            // lookup returns an entry with no childMap and resolution is a no-op
            // that yields the body's own uuid.
            const element0 = this.getElement(rb0.uuid);
            const element1 = this.getElement(rb1.uuid);

            let contacts = [];
            // Elements that should receive this collision: the two body roots
            // plus, for compounds, the specific child colliders actually hit.
            const targets = new Set([rb0.uuid, rb1.uuid]);

            for (let j = 0; j < numContacts; j++) {
                let contactPoint = contactManifold.getContactPoint(j);
                let distance = contactPoint.getDistance();

                if (distance > 0.0) continue;

                let velocity0 = rb0.getLinearVelocity();
                let velocity1 = rb1.getLinearVelocity();
                let worldPos0 = contactPoint.get_m_positionWorldOnA();
                let worldPos1 = contactPoint.get_m_positionWorldOnB();
                let localPos0 = contactPoint.get_m_localPointA();
                let localPos1 = contactPoint.get_m_localPointB();

                // Map the contact to the compound child it belongs to (or the
                // body's own uuid for a plain body) so per-child collision
                // scripting keeps working.
                const uuid0 = resolveChildUuid(element0, localPos0);
                const uuid1 = resolveChildUuid(element1, localPos1);
                targets.add(uuid0);
                targets.add(uuid1);

                contacts.push({
                    distance,
                    elements: [
                        {
                            uuid: uuid0,
                            velocity: { x: velocity0.x(), y: velocity0.y(), z: velocity0.z() },
                            worldPos: { x: worldPos0.x(), y: worldPos0.y(), z: worldPos0.z() },
                            localPos: { x: localPos0.x(), y: localPos0.y(), z: localPos0.z() },
                        },
                        {
                            uuid: uuid1,
                            velocity: { x: velocity1.x(), y: velocity1.y(), z: velocity1.z() },
                            worldPos: { x: worldPos1.x(), y: worldPos1.y(), z: worldPos1.z() },
                            localPos: { x: localPos1.x(), y: localPos1.y(), z: localPos1.z() },
                        },
                    ],
                });
            }

            targets.forEach(uuid =>
                dispatcher.sendDispatchEvent(uuid, PHYSICS_EVENTS.ELEMENT.COLLISION, { contacts }),
            );
        }
    };

    addElement = data => {
        this.elements[data.uuid] = data;
    };

    updateBodyState = ({ uuid, state }) => {
        if (this.hasElement(uuid)) {
            this.elements[uuid].state = {
                ...this.elements[uuid].state,
                ...state,
            };
        }
    };

    disposeBody({ uuid }) {
        const element = this.getElement(uuid);
        this.dynamicsWorld.removeRigidBody(element.body);
        this.removeElement(uuid);

        dispatcher.sendElementDisposed({ uuid });
    }

    terminate = () => {
        Ammo.destroy(this.dynamicsWorld);
        Ammo.destroy(this.solver);
        Ammo.destroy(this.dispatcher);
        Ammo.destroy(this.collisionConfiguration);

        cancelAnimationFrame(this.requestAnimationFrameId);

        dispatcher.sendTerminateEvent();
    };
}

export default new World();
