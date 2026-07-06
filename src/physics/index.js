import { EventDispatcher, Vector3, Quaternion } from "three";
import Universe from "../core/universe";
import Config from "../core/config";
import PhysicsWorker from "worker:./worker";

import { PHYSICS_EVENTS } from "./messages";
import * as physicsUtils from "./utils";
import { getHostURL } from "../lib/url";
import env from "../env";
import { PHYSICS_ELEMENT_ALREADY_STORED, PHYSICS_ELEMENT_CANT_BE_REMOVED } from "../lib/messages";

import * as PHYSICS_CONSTANTS from "./constants";

const { COLLIDER_TYPES } = PHYSICS_CONSTANTS;

const {
    getBoxDescriptionForElement,
    extractPositionAndQuaternion,
    mapColliderTypeToDescription,
    iterateGeometries,
    mapColliderTypeToAddEvent,
    DEFAULT_DESCRIPTION,
} = physicsUtils;

const WORKER_READY_TIMEOUT = 200;
const PHYSICS_STATE_TIMEOUT = 50;
export const PHYSICS_STATES = {
    READY: "READY",
    TERMINATING: "TERMINATING",
    TERMINATED: "TERMINATED",
};

export class Physics extends EventDispatcher {
    constructor() {
        super();
        this.elements = [];
        this.isWorkerReady = false;
        this.state = PHYSICS_STATES.READY;
    }

    createWorker() {
        this.worker = new PhysicsWorker();
        this.workerReady = false;
        this.state = PHYSICS_STATES.READY;
        this.worker.onmessage = this.handleWorkerMessages;
    }

    isTerminating() {
        return this.state === PHYSICS_STATES.TERMINATING;
    }
    isTerminated() {
        return this.state === PHYSICS_STATES.TERMINATED;
    }
    isReady() {
        return this.state === PHYSICS_STATES.READY;
    }

    waitForState(state) {
        return new Promise(resolve => {
            const isStateReached = () => this.state === state;
            const check = () => {
                setTimeout(() => {
                    if (isStateReached()) {
                        resolve();
                    } else {
                        check();
                    }
                }, PHYSICS_STATE_TIMEOUT);
            };

            check();
        });
    }

    dispose() {
        if (Config.physics().enabled) {
            this.state = PHYSICS_STATES.TERMINATING;
            this.worker.postMessage({
                event: PHYSICS_EVENTS.TERMINATE,
            });

            this.elements = [];
        }
    }

    hasElement(element) {
        const uuid = element.uuid();

        return this.elements.includes(uuid);
    }

    storeElement(element, _options) {
        if (!this.hasElement(element)) {
            const uuid = element.uuid();
            this.elements.push(uuid);
        } else {
            console.log(PHYSICS_ELEMENT_ALREADY_STORED, element);
        }
    }

    removeElement(element) {
        if (this.hasElement(element)) {
            const uuid = element.uuid();
            this.elements.splice(this.elements.indexOf(uuid), 1);
        } else {
            console.log(PHYSICS_ELEMENT_CANT_BE_REMOVED);
        }
    }

    init() {
        if (Config.physics().enabled) {
            this.createWorker();

            // Resolve ammo.js using MAGE_ASSETS_BASE_URL (same as models,
            // images, and audio) so the path works identically in local
            // preview and production.
            const baseUrl = env.MAGE_ASSETS_BASE_URL;
            const host = baseUrl ? `${getHostURL()}/${baseUrl}` : getHostURL();

            this.worker.postMessage({
                event: PHYSICS_EVENTS.LOAD.AMMO,
                ...Config.physics(),
                host,
            });

            return new Promise(resolve => {
                const isWorkerReady = () => this.workerReady;
                const check = () => {
                    setTimeout(() => {
                        if (isWorkerReady()) {
                            resolve();
                        } else {
                            check();
                        }
                    }, WORKER_READY_TIMEOUT);
                };

                check();
            });
        }

        return Promise.resolve();
    }

    handleWorkerMessages = ({ data }) => {
        switch (data.event) {
            case PHYSICS_EVENTS.READY:
                this.workerReady = true;
                break;
            case PHYSICS_EVENTS.ELEMENT.UPDATE:
                this.handleBodyUpdate(data);
                break;
            case PHYSICS_EVENTS.TERMINATE:
                this.handleTerminateEvent();
                break;
            case PHYSICS_EVENTS.DISPATCH:
                this.handleDispatchEvent(data);
                break;
            case PHYSICS_EVENTS.UPDATE:
                this.handlePhysicsUpdate(data);
                break;
            default:
                break;
        }
    };

    handlePhysicsUpdate = ({ dt }) => {
        this.dispatchEvent({
            type: PHYSICS_EVENTS.UPDATE,
            dt,
        });
    };

    handleTerminateEvent = () => {
        this.worker.terminate();
        this.state = PHYSICS_STATES.READY;
    };

    handleBodyUpdate = ({ uuid, ...data }) => {
        const element = Universe.getByUUID(uuid);

        if (element) {
            if (element.getPhysicsOptions("applyPhysicsUpdate")) {
                element.handlePhysicsUpdate(data);
            } else {
                element.dispatchEvent({
                    type: PHYSICS_EVENTS.ELEMENT.UPDATE,
                    ...data,
                });
            }
        }
    };

    handleDispatchEvent = ({ uuid, eventData, eventName }) => {
        const element = Universe.getByUUID(uuid);
        if (element) {
            element.dispatchEvent({
                type: eventName,
                data: eventData,
            });
        }
    };

    disposeElement(element) {
        if (Config.physics().enabled && this.hasElement(element)) {
            const uuid = element.uuid();

            this.removeElement(element);
            this.worker.postMessage({
                event: PHYSICS_EVENTS.ELEMENT.DISPOSE,
                uuid,
            });
        }
    }

    add(element, options = {}) {
        if (Config.physics().enabled) {
            const {
                colliderType = COLLIDER_TYPES.BOX,
                colliderWidth,
                colliderHeight,
                colliderLength,
                colliderRadius,
                ...rest
            } = options;

            const uuid = element.uuid();
            const description = {
                ...mapColliderTypeToDescription(colliderType)(element),
                ...rest,
            };

            if (colliderWidth != null) description.width = colliderWidth;
            if (colliderHeight != null) description.height = colliderHeight;
            if (colliderLength != null) description.length = colliderLength;
            if (colliderRadius != null) description.radius = colliderRadius;

            this.storeElement(element, options);

            this.worker.postMessage({
                event: mapColliderTypeToAddEvent(description.collider),
                ...description,
                uuid,
            });
        }
    }

    // Collect every physics-enabled descendant of `root` (its rigidly-attached
    // children), descending through non-physics elements too. These become child
    // shapes of the root's compound body.
    collectPhysicsSubtree(root) {
        const collected = [];
        const walk = element => {
            (element.children || []).forEach(child => {
                if (child.isPhysicsEnabled && child.isPhysicsEnabled()) {
                    collected.push(child);
                }
                walk(child);
            });
        };
        walk(root);
        return collected;
    }

    // Describe one collider element in the compound root's local frame: its
    // collider type, world-space size, and parent-relative position/rotation.
    buildCompoundShape(element, rootWorldPos, invRootQuat) {
        const options = element.getPhysicsOptions() || {};
        const colliderType = options.colliderType || COLLIDER_TYPES.BOX;
        const description = mapColliderTypeToDescription(colliderType)(element);

        const body = element.getBody();
        const worldPos = body.getWorldPosition(new Vector3());
        const worldQuat = body.getWorldQuaternion(new Quaternion());

        // The compound body sits at (rootWorldPos, rootWorldQuat) with no scale,
        // so a child's offset in that frame is its world displacement rotated
        // back into the root's rotation. Size already comes from the world AABB,
        // so we intentionally carry only rotation+translation here (no scale).
        const localPos = worldPos.clone().sub(rootWorldPos).applyQuaternion(invRootQuat);
        const localQuat = invRootQuat.clone().multiply(worldQuat);

        const shape = {
            childUuid: element.uuid(),
            colliderType,
            localPosition: { x: localPos.x, y: localPos.y, z: localPos.z },
            localQuaternion: { x: localQuat.x, y: localQuat.y, z: localQuat.z, w: localQuat.w },
        };

        // World-space size, with explicit per-axis overrides (mirrors add()).
        if (colliderType === COLLIDER_TYPES.SPHERE) {
            shape.radius =
                options.colliderRadius != null ? options.colliderRadius : description.radius;
        } else {
            shape.width = options.colliderWidth != null ? options.colliderWidth : description.width;
            shape.height =
                options.colliderHeight != null ? options.colliderHeight : description.height;
            shape.length =
                options.colliderLength != null ? options.colliderLength : description.length;
        }

        return shape;
    }

    // Realize a physics subtree as a single rigid body. If `root` has no
    // physics-enabled descendants it takes the normal single-body path; otherwise
    // root + welded children become one btCompoundShape body so rotating the root
    // (e.g. a kinematic platform) carries every child collider with it.
    realizeSubtree(root) {
        if (!Config.physics().enabled) return;
        if (this.hasElement(root)) return;

        const descendants = this.collectPhysicsSubtree(root);

        if (descendants.length === 0) {
            this.add(root, root.getPhysicsOptions());
            return;
        }

        const rootBody = root.getBody();
        rootBody.updateWorldMatrix(true, true);

        const rootWorldPos = rootBody.getWorldPosition(new Vector3());
        const rootWorldQuat = rootBody.getWorldQuaternion(new Quaternion());
        const invRootQuat = rootWorldQuat.clone().invert();

        // shapes[0] is the root collider at local identity; the rest are children.
        const colliders = [root, ...descendants];
        const shapes = colliders.map(element =>
            this.buildCompoundShape(element, rootWorldPos, invRootQuat),
        );

        const options = root.getPhysicsOptions() || {};

        this.storeElement(root, options);

        this.worker.postMessage({
            event: PHYSICS_EVENTS.ADD.COMPOUND,
            uuid: root.uuid(),
            position: { x: rootWorldPos.x, y: rootWorldPos.y, z: rootWorldPos.z },
            quaternion: {
                x: rootWorldQuat.x,
                y: rootWorldQuat.y,
                z: rootWorldQuat.z,
                w: rootWorldQuat.w,
            },
            mass: options.mass != null ? options.mass : 0,
            friction: options.friction,
            kinematic: !!options.kinematic,
            shapes,
        });
    }

    // Walk from `element` up its parent chain (inclusive) and return the topmost
    // physics-enabled ancestor — the root whose compound body owns element's
    // collider — or null if element is under no physics umbrella.
    topmostPhysicsRoot(element) {
        let root = null;
        let current = element;
        while (current) {
            if (current.isPhysicsEnabled && current.isPhysicsEnabled()) root = current;
            current = current.getParent ? current.getParent() : null;
        }
        return root;
    }

    // Physics roots (topmost-physics nodes) located within `element`'s subtree
    // (inclusive) — used when a moved subtree ends up under no physics parent and
    // each such node must become its own body again.
    collectRootsInSubtree(element) {
        const roots = [];
        const visit = el => {
            if (
                el.isPhysicsEnabled &&
                el.isPhysicsEnabled() &&
                this.topmostPhysicsRoot(el) === el
            ) {
                roots.push(el);
            }
            (el.children || []).forEach(visit);
        };
        visit(element);
        return roots;
    }

    // Already-realized bodies whose element sits inside `element`'s subtree
    // (inclusive) — independent roots that travel with a moved subtree and whose
    // bodies are therefore stale after the move.
    realizedRootsInSubtree(element) {
        const found = [];
        const visit = el => {
            if (el.uuid && this.elements.includes(el.uuid())) found.push(el);
            (el.children || []).forEach(visit);
        };
        visit(element);
        return found;
    }

    // Tear down a realized body by uuid (its compound or single body) without
    // needing the element instance — used when reconciling reparents.
    disposeByUuid(uuid) {
        if (!this.worker || !this.elements.includes(uuid)) return;
        this.elements.splice(this.elements.indexOf(uuid), 1);
        this.worker.postMessage({ event: PHYSICS_EVENTS.ELEMENT.DISPOSE, uuid });
    }

    // Reconcile compound bodies after `element` was reparented away from
    // `oldParent`. A child leaving/joining a physics parent changes which
    // compound its collider belongs to, so we tear down the stale bodies on both
    // sides of the move and rebuild the affected roots from the current hierarchy.
    // No-op until physics is realized (e.g. during import), so import-time
    // parenting is unaffected.
    rebuildAfterReparent(element, oldParent) {
        if (!Config.physics().enabled || !this.worker) return;
        // Nothing realized yet (e.g. mid-import, before realizePhysics runs) —
        // the final hierarchy will be realized in one pass, so stay out of it.
        if (this.elements.length === 0) return;

        const disposeUuids = new Set();
        const realizeRoots = new Map();
        const wantRealize = el => {
            if (el && el.isPhysicsEnabled && el.isPhysicsEnabled()) {
                realizeRoots.set(el.uuid(), el);
            }
        };

        // Independent bodies that travelled inside the moved subtree are stale.
        this.realizedRootsInSubtree(element).forEach(el => disposeUuids.add(el.uuid()));

        // The root of the position element left loses element's colliders.
        const oldRoot = oldParent ? this.topmostPhysicsRoot(oldParent) : null;
        if (oldRoot) {
            disposeUuids.add(oldRoot.uuid());
            wantRealize(oldRoot);
        }

        // The root element landed under (inclusive of element) gains them; with no
        // physics umbrella, each physics root in the moved subtree stands alone.
        const newRoot = this.topmostPhysicsRoot(element);
        if (newRoot) {
            disposeUuids.add(newRoot.uuid());
            wantRealize(newRoot);
        } else {
            this.collectRootsInSubtree(element).forEach(wantRealize);
        }

        // Dispose stale bodies first so realizeSubtree rebuilds from a clean slate.
        disposeUuids.forEach(uuid => this.disposeByUuid(uuid));
        realizeRoots.forEach(el => this.realizeSubtree(el));
    }

    addVehicle(element, options) {
        if (Config.physics().enabled) {
            const uuid = element.uuid();
            const description = getBoxDescriptionForElement(element);

            this.storeElement(element, options);

            this.worker.postMessage({
                event: PHYSICS_EVENTS.ADD.VEHICLE,
                uuid,
                ...description,
                ...options,
            });
        }
    }

    addModel(model, options) {
        if (Config.physics().enabled) {
            const uuid = model.uuid();
            const vertices = [];
            const matrices = [];
            const indexes = [];

            iterateGeometries(model.getBody(), {}, (vertexArray, matrixArray, indexArray) => {
                vertices.push(vertexArray);
                matrices.push(matrixArray);
                indexes.push(indexArray);
            });

            this.storeElement(model, options);

            this.worker.postMessage({
                event: PHYSICS_EVENTS.ADD.MODEL,
                uuid,
                vertices,
                matrices,
                indexes,
                ...DEFAULT_DESCRIPTION,
                ...extractPositionAndQuaternion(model),
                ...options,
            });
        }
    }

    setLinearVelocity = (element, velocity) => {
        if (Config.physics().enabled) {
            const uuid = element.uuid();

            this.worker.postMessage({
                event: PHYSICS_EVENTS.ELEMENT.SET.LINEAR_VELOCITY,
                uuid,
                velocity,
            });
        }
    };

    setPosition = (element, position) => {
        this.setElementPosition(element, position);
    };

    setElementPosition = (element, position) => {
        if (Config.physics().enabled) {
            const uuid = element.uuid();

            this.worker.postMessage({
                event: PHYSICS_EVENTS.ELEMENT.SET.POSITION,
                uuid,
                position,
            });
        }
    };

    setElementQuaternion = (element, quaternion) => {
        if (Config.physics().enabled) {
            const uuid = element.uuid();

            this.worker.postMessage({
                event: PHYSICS_EVENTS.ELEMENT.SET.QUATERNION,
                uuid,
                quaternion,
            });
        }
    };

    resetElement = (element, position, quaternion) => {
        if (Config.physics().enabled) {
            const uuid = element.uuid();

            this.worker.postMessage({
                event: PHYSICS_EVENTS.ELEMENT.RESET,
                uuid,
                position,
                quaternion,
            });
        }
    };

    setVehiclePosition = (vehicle, { x, y, z }) => {
        if (Config.physics().enabled) {
            const uuid = vehicle.uuid();

            this.worker.postMessage({
                event: PHYSICS_EVENTS.VEHICLE.SET.POSITION,
                uuid,
                position: { x, y, z },
            });
        }
    };

    setVehicleQuaternion = (vehicle, { x, y, z, w }) => {
        if (Config.physics().enabled) {
            const uuid = vehicle.uuid();

            this.worker.postMessage({
                event: PHYSICS_EVENTS.VEHICLE.SET.QUATERNION,
                uuid,
                quaternion: { x, y, z, w },
            });
        }
    };

    resetVehicle = (vehicle, position, quaternion) => {
        if (Config.physics().enabled) {
            const uuid = vehicle.uuid();

            this.worker.postMessage({
                event: PHYSICS_EVENTS.VEHICLE.RESET,
                uuid,
                quaternion: {
                    x: quaternion.x,
                    y: quaternion.y,
                    z: quaternion.z,
                    w: quaternion.w,
                },
                position: {
                    x: position.x,
                    y: position.y,
                    z: position.z,
                },
            });
        }
    };

    applyImpulse = (element, impulse) => {
        if (Config.physics().enabled) {
            const uuid = element.uuid();

            this.worker.postMessage({
                event: PHYSICS_EVENTS.ELEMENT.APPLY.IMPULSE,
                uuid,
                impulse,
            });
        }
    };

    updateBodyState(element, state) {
        if (Config.physics().enabled) {
            const uuid = element.uuid();

            this.worker.postMessage({
                event: PHYSICS_EVENTS.ELEMENT.UPDATE,
                uuid,
                state,
            });
        }
    }

    explosion = (element, strength, radius) => {
        if (Config.physics().enabled) {
            const uuid = element.uuid();

            this.worker.postMessage({
                event: PHYSICS_EVENTS.EFFECTS.EXPLOSION,
                uuid,
                strength,
                radius,
            });
        }
    };
}

export { PHYSICS_EVENTS, PHYSICS_CONSTANTS, physicsUtils };

export default new Physics();
