import { EventDispatcher, Vector3, Quaternion, Box3, Matrix4 } from "three";
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
    extractHullPoints,
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
        // Debounce state for refreshOwningBody.
        this.pendingRefreshRoots = new Map();
        this.refreshTimer = null;
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
            if (options.colliderType === COLLIDER_TYPES.NONE) {
                // NONE only makes sense as the shapeless frame of a compound —
                // a standalone NONE body would silently collide as a default
                // box, so fail loudly instead.
                throw new Error(
                    `Physics.add: colliderType NONE is only valid for an element with physics-enabled descendants (got standalone element ${element.uuid()})`,
                );
            }
            if (options.colliderType === COLLIDER_TYPES.HULL) {
                // Hulls are built as compound leaves — this path has no way to
                // carry the hull's points and would silently fall back to a box
                // description. realizeSubtree is the only correct entry point.
                throw new Error(
                    `Physics.add: colliderType HULL must be realized through realizeSubtree (got standalone element ${element.uuid()})`,
                );
            }
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
    // collider type, size, and parent-relative position/rotation. `siblingBodies`
    // are the bodies of the OTHER colliders in the compound (each becomes its own
    // shape), so this element's geometry is measured without swallowing them.
    buildCompoundShape(element, rootWorldPos, invRootQuat, siblingBodies) {
        const options = element.getPhysicsOptions() || {};
        const colliderType = options.colliderType || COLLIDER_TYPES.BOX;

        const body = element.getBody();
        const worldQuat = body.getWorldQuaternion(new Quaternion());
        const excluded = new Set(siblingBodies.filter(b => b !== body));

        // Orientation of this collider relative to the compound root. The root
        // body carries no scale, so children are placed with rotation +
        // translation only.
        const localQuat = invRootQuat.clone().multiply(worldQuat);

        const { worldCenter, size } = this.measureCollider(body, worldQuat, excluded);

        // Position the shape at the collider's true world CENTER (a mesh's
        // geometry can be offset from its element origin), in the root's frame.
        const localPos = worldCenter.clone().sub(rootWorldPos).applyQuaternion(invRootQuat);

        const shape = {
            childUuid: element.uuid(),
            colliderType,
            localPosition: { x: localPos.x, y: localPos.y, z: localPos.z },
            localQuaternion: { x: localQuat.x, y: localQuat.y, z: localQuat.z, w: localQuat.w },
        };

        if (colliderType === COLLIDER_TYPES.SPHERE) {
            const radius = Math.max(size.width, size.height, size.length) / 2;
            shape.radius = options.colliderRadius != null ? options.colliderRadius : radius;
        } else {
            shape.width = options.colliderWidth != null ? options.colliderWidth : size.width;
            shape.height = options.colliderHeight != null ? options.colliderHeight : size.height;
            shape.length = options.colliderLength != null ? options.colliderLength : size.length;
        }

        // A hull is defined by its geometry, so the measured box above is kept
        // only as the shape's AABB — it still sizes CCD and drives the childMap
        // region test — while `points` carries the actual shape to the worker.
        if (colliderType === COLLIDER_TYPES.HULL) {
            const points = extractHullPoints(body, worldCenter, worldQuat, excluded);

            if (points) {
                shape.points = points;
            } else {
                // No geometry to wrap (an empty holder, or fully coplanar
                // vertices). Degrade to the measured box rather than shipping a
                // shapeless hull the worker can't build.
                shape.colliderType = COLLIDER_TYPES.BOX;
                console.warn(
                    `[Mage] Physics: element ${element.uuid()} has colliderType HULL but no geometry to wrap — falling back to a BOX collider`,
                );
            }
        }

        return shape;
    }

    // Measure a collider's own geometry: its world-space center and its *un-rotated*
    // box size. Two things matter here:
    //  - We skip `excluded` bodies (the compound's other collider elements, which
    //    are THREE children of this body) so a parent shape doesn't swallow its
    //    children's geometry.
    //  - Size is measured after removing the element's world rotation, so a rotated
    //    element (e.g. an upright wall) reports its real extents instead of an
    //    inflated axis-aligned bound that localQuaternion would then rotate again.
    // Falls back to the body origin / a unit box when there is no own geometry.
    measureCollider(body, worldQuat, excluded) {
        body.updateWorldMatrix(true, true);
        const unrotate = new Matrix4().makeRotationFromQuaternion(worldQuat.clone().invert());
        const worldBox = new Box3(); // for the center (axis-aligned, world)
        const sizeBox = new Box3(); // for the size (rotation removed)
        let found = false;

        const visit = obj => {
            if (obj !== body && excluded.has(obj)) return; // skip a child element's subtree
            if (obj.geometry) {
                if (!obj.geometry.boundingBox) obj.geometry.computeBoundingBox();
                // World AABB (its center is the true world center of the box).
                worldBox.union(obj.geometry.boundingBox.clone().applyMatrix4(obj.matrixWorld));
                // Un-rotate and measure in ONE transform: applying matrixWorld
                // first would already collapse the rotated box to an inflated
                // axis-aligned bound. `unrotate * matrixWorld` has no net rotation,
                // so the resulting AABB is the box's true (scaled) extent.
                const combined = unrotate.clone().multiply(obj.matrixWorld);
                sizeBox.union(obj.geometry.boundingBox.clone().applyMatrix4(combined));
                found = true;
            }
            for (const child of obj.children) visit(child);
        };
        visit(body);

        if (!found) {
            // No own geometry (visit() above already skipped the `excluded`
            // child-element subtrees). Do NOT measure the world AABB of the
            // whole subtree here: the only geometry it could pick up is the
            // excluded children's, which would turn a geometry-less holder
            // root into one giant box filling the gaps between its children.
            // A unit box at the body origin is the honest fallback.
            return {
                worldCenter: body.getWorldPosition(new Vector3()),
                size: { width: 1, height: 1, length: 1 },
            };
        }

        const worldCenter = worldBox.getCenter(new Vector3());
        const s = sizeBox.getSize(new Vector3());
        return { worldCenter, size: { width: s.x, height: s.y, length: s.z } };
    }

    // Realize a physics subtree as a single rigid body. If `root` has no
    // physics-enabled descendants it takes the normal single-body path; otherwise
    // root + welded children become one btCompoundShape body so rotating the root
    // (e.g. a kinematic platform) carries every child collider with it.
    realizeSubtree(root) {
        if (!Config.physics().enabled) return;
        if (this.hasElement(root)) return;

        const descendants = this.collectPhysicsSubtree(root);
        const rootType = (root.getPhysicsOptions() || {}).colliderType || COLLIDER_TYPES.BOX;

        // Box/Sphere colliders — with or without physics children — are built via
        // the compound path so EVERY collider is measured and placed the same
        // way: in world space, offset to its true geometry center, sized by its
        // un-rotated extents, and oriented by its world rotation. This keeps a
        // lone box/sphere aligned with its geometry regardless of scale, rotation,
        // offset, or being nested under a non-physics parent. Hulls join them for
        // the same reason — and because a hull is only useful if it can weld into
        // a compound. Player/Vehicle/Model keep their dedicated single-body path.
        const COMPOUND_CAPABLE = [
            COLLIDER_TYPES.BOX,
            COLLIDER_TYPES.SPHERE,
            COLLIDER_TYPES.HULL,
            COLLIDER_TYPES.NONE,
        ];
        if (descendants.length === 0 && !COMPOUND_CAPABLE.includes(rootType)) {
            this.add(root, root.getPhysicsOptions());
            return;
        }

        const rootBody = root.getBody();
        rootBody.updateWorldMatrix(true, true);

        const rootWorldPos = rootBody.getWorldPosition(new Vector3());
        const rootWorldQuat = rootBody.getWorldQuaternion(new Quaternion());
        const invRootQuat = rootWorldQuat.clone().invert();

        // The root collider comes first, at local identity; the rest are
        // children. Elements with colliderType NONE stay part of the compound
        // frame (their descendants still weld to this body) but contribute no
        // shape — the worker's childMap carries no positional assumptions, so
        // skipping any of them (including the root) is safe.
        const colliders = [root, ...descendants];
        const colliderBodies = colliders.map(c => c.getBody());
        const shaped = colliders.filter(
            element => (element.getPhysicsOptions() || {}).colliderType !== COLLIDER_TYPES.NONE,
        );

        // Every collider in this subtree is NONE. That is a legitimate thing to
        // author — an element that exists in the scene graph, keeps its physics
        // options, and can gain colliding children later, but is itself
        // transparent to collisions. Build no body and leave the subtree
        // physics-free rather than failing: there is no invalid call here to
        // surface, only a configuration that needs no rigid body.
        //
        // A NONE root WITH shaped descendants is unaffected — it still frames
        // their compound below; only the all-NONE case returns here.
        if (shaped.length === 0) {
            return;
        }

        const shapes = shaped.map(element =>
            this.buildCompoundShape(element, rootWorldPos, invRootQuat, colliderBodies),
        );

        const options = root.getPhysicsOptions() || {};

        // Continuous collision detection radius for a dynamic compound: sized from
        // the THINNEST leaf so a fast body can't tunnel through the smallest
        // shape. Matches the single-body box/sphere CCD (a lone box/sphere now
        // realizes as a one-shape compound, so it must keep its CCD here).
        const ccdRadius = shapes.reduce((min, s) => {
            const r =
                s.radius != null
                    ? s.radius
                    : Math.min(s.width || 1, s.height || 1, s.length || 1) / 2;
            return Math.min(min, r);
        }, Infinity);

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
            collisionEvents: !!options.collisionEvents,
            ccdRadius: Number.isFinite(ccdRadius) ? ccdRadius : 0,
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

    // Rebuild the realized body owning `element`'s collider after a change that
    // stales baked shape data: the scale of any collider, or the local
    // position/rotation of a compound member (compound shapes bake child sizes
    // and parent-relative transforms at build time — see buildCompoundShape).
    // Debounced per root so a drag rebuilds each affected body once per flush,
    // not once per mouse event. Elements outside any realized physics body
    // (mid-import, editor with physics off, plain visuals) are not physics
    // callers to fail loudly on — this is a broadcast hook from the transform
    // setters, so those simply fall through. Note a dynamic (mass > 0) body
    // loses its velocities on rebuild, as with rebuildAfterReparent.
    refreshOwningBody(element) {
        if (!Config.physics().enabled || !this.worker) return;

        const root = this.topmostPhysicsRoot(element);
        if (!root || !this.elements.includes(root.uuid())) return;

        this.pendingRefreshRoots.set(root.uuid(), root);

        if (this.refreshTimer !== null) return;
        this.refreshTimer = setTimeout(() => {
            this.refreshTimer = null;
            const roots = this.pendingRefreshRoots;
            this.pendingRefreshRoots = new Map();
            roots.forEach(pendingRoot => {
                this.disposeByUuid(pendingRoot.uuid());
                this.realizeSubtree(pendingRoot);
            });
        }, 0);
    }

    // Realize physics for `element` after it is enabled at RUNTIME (not during
    // import, which batches everything through Importer.realizePhysics). The
    // element joins the world through its topmost physics root: nested under an
    // existing physics ancestor it becomes part of that compound; otherwise it
    // becomes its own root. Any bodies already realized inside that root's
    // subtree are torn down first so they are cleanly re-absorbed, then the whole
    // root is rebuilt through the same world-space path as import — so a
    // runtime-enabled collider aligns with its geometry regardless of scale,
    // rotation, offset, or nesting, exactly like an imported one.
    realizeElement(element) {
        if (!Config.physics().enabled || !this.worker) return;

        const root = this.topmostPhysicsRoot(element) || element;

        // Tear down every already-realized body in the root's subtree (the root's
        // own stale body, plus any independent bodies now folded into its
        // compound), then rebuild the root from the current hierarchy.
        this.realizedRootsInSubtree(root).forEach(el => this.disposeByUuid(el.uuid()));
        this.disposeByUuid(root.uuid());
        this.realizeSubtree(root);
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
