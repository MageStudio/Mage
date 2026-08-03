import { Box3, Matrix4, Quaternion, Vector3 } from "three";
import { ConvexHull } from "three/examples/jsm/math/ConvexHull.js";
import { PHYSICS_EVENTS } from "./messages";

import { getSphereVolume } from "../lib/math";

import { BOUNDINGBOX_NOT_AVAILABLE } from "../lib/messages";
import { DEFAULT_QUATERNION, DEFAULT_POSITION } from "./constants";
import { COLLIDER_TYPES } from "./constants";

export const DEFAULT_DESCRIPTION = {
    mass: 0,
    friction: 1,
    quaternion: DEFAULT_QUATERNION,
    position: DEFAULT_POSITION,
};

const DEFAULT_BOX_DESCRIPTION = {
    ...DEFAULT_DESCRIPTION,
    width: 2,
    length: 2,
    height: 2,
    collider: COLLIDER_TYPES.BOX,
};

const DEFAULT_SPHERE_DESCRIPTION = {
    ...DEFAULT_DESCRIPTION,
    radius: 2,
    collider: COLLIDER_TYPES.SPHERE,
};

const DEFAULT_PLAYER_DESCRIPTION = {
    ...DEFAULT_DESCRIPTION,
    width: 0.5,
    height: 1.8,
    collider: COLLIDER_TYPES.PLAYER,
};

export const mapColliderTypeToAddEvent = type =>
    ({
        [COLLIDER_TYPES.BOX]: PHYSICS_EVENTS.ADD.BOX,
        [COLLIDER_TYPES.VEHICLE]: PHYSICS_EVENTS.ADD.VEHICLE,
        [COLLIDER_TYPES.PLAYER]: PHYSICS_EVENTS.ADD.PLAYER,
        [COLLIDER_TYPES.SPHERE]: PHYSICS_EVENTS.ADD.SPHERE,
    })[type] || PHYSICS_EVENTS.ADD.BOX;

export const extractBoundingBox = body => {
    body.geometry.computeBoundingBox();
    return body.geometry.boundingBox;
};

export const extractBiggestBoundingBox = body => {
    const boxes = [];
    body?.traverse?.(child => {
        if (child.geometry) {
            boxes.push(extractBoundingBox(child));
        }
    });

    // sorting by volume
    return boxes.sort((boxA, boxB) => {
        const vectorA = new Vector3();
        const vectorB = new Vector3();

        boxA.getSize(vectorA);
        boxB.getSize(vectorB);

        return vectorB.x * vectorB.y * vectorB.z - vectorA.x * vectorA.y * vectorA.z;
    })[0];
};

export const extractBoundingSphere = body => {
    body.geometry.computeBoundingSphere();
    return body.geometry.boundingSphere;
};

export const extractBiggestBoundingSphere = body => {
    if (!body || typeof body.traverse !== "function") {
        console.warn("[Mage] extractBiggestBoundingSphere received invalid body");
        return null;
    }

    const spheres = [];
    body.traverse(child => {
        if (child.geometry) {
            spheres.push(extractBoundingSphere(child));
        }
    });

    // sorting by volume
    return spheres.sort(
        (sphereA, sphereB) => getSphereVolume(sphereB.radius) - getSphereVolume(sphereA.radius),
    )[0];
};

export const parseBoundingBoxSize = (boundingBox = {}) => {
    try {
        const size = new Vector3();
        boundingBox.getSize(size);

        const { x: sizeX, y: sizeY, z: sizeZ } = size;

        return {
            x: sizeX,
            y: sizeY,
            z: sizeZ,
        };
    } catch {
        console.log(BOUNDINGBOX_NOT_AVAILABLE);
        return {
            x: 1,
            y: 1,
            z: 1,
        };
    }
};

/**
 * Compute the world-space AABB size for a body using Box3.setFromObject().
 * Returns { width, height, length } or null if the box is degenerate (all zeros).
 */
export const getWorldBoundingBoxSize = body => {
    const worldBox = new Box3().setFromObject(body);
    const worldSize = new Vector3();
    worldBox.getSize(worldSize);

    if (worldSize.x === 0 && worldSize.y === 0 && worldSize.z === 0) {
        return null;
    }

    return { width: worldSize.x, height: worldSize.y, length: worldSize.z };
};

/**
 * Box size measured with the body's WORLD ROTATION REMOVED, so a rotated element
 * reports its true (scaled) extents instead of the inflated axis-aligned world
 * AABB. Applying `unrotate * matrixWorld` in one transform has no net rotation,
 * so the resulting AABB is the box's real footprint — the collider's quaternion
 * (carried separately) then orients it. Mirrors Physics.measureCollider's sizing.
 * Returns { width, height, length } or null when there is no geometry / it is
 * degenerate. WITHOUT this, a thin slab tilted 20° would be sized as an ~8x
 * taller block and sit well above its visible surface.
 */
export const getUnrotatedWorldBoxSize = body => {
    body.updateWorldMatrix(true, true);
    const worldQuat = body.getWorldQuaternion(new Quaternion());
    const unrotate = new Matrix4().makeRotationFromQuaternion(worldQuat.clone().invert());
    const sizeBox = new Box3();
    let found = false;

    body.traverse(obj => {
        if (!obj.geometry) return;
        if (!obj.geometry.boundingBox) obj.geometry.computeBoundingBox();
        const combined = unrotate.clone().multiply(obj.matrixWorld);
        sizeBox.union(obj.geometry.boundingBox.clone().applyMatrix4(combined));
        found = true;
    });

    if (!found) return null;
    const s = sizeBox.getSize(new Vector3());
    if (s.x === 0 && s.y === 0 && s.z === 0) return null;
    return { width: s.x, height: s.y, length: s.z };
};

/**
 * Derive a bounding sphere radius from the world-space AABB.
 * Returns the radius (half the longest axis) or null if the box is degenerate.
 */
export const getWorldBoundingSphereRadius = body => {
    const size = getWorldBoundingBoxSize(body);
    if (!size) return null;
    return Math.max(size.width, size.height, size.length) / 2;
};

export const extractPositionAndQuaternion = element => {
    const { x, y, z } = element.getPosition();
    const quaternion = element.getQuaternion();

    return {
        position: { x, y, z },
        quaternion: { x: quaternion.x, y: quaternion.y, z: quaternion.z, w: quaternion.w },
    };
};

// Original bounding-box path — uses the pre-computed element.boundingBox
// which comes from evaluateBoundingBox() during postBodyCreation().
// Reliable for individual elements whose bounding box is already computed.
export const extractBoxDescription = element => {
    const scale = element.getScale();
    const size = parseBoundingBoxSize(element.boundingBox);

    return {
        width: size.x * scale.x,
        height: size.y * scale.y,
        length: size.z * scale.z,
        size,
        ...extractPositionAndQuaternion(element),
    };
};

// World-geometry path — measures the body's real extents (handling geometry
// offset from the element origin) but with the world rotation removed, so a
// rotated element is sized by its true footprint rather than the inflated
// axis-aligned world AABB. The collider's quaternion (from
// extractPositionAndQuaternion) then orients that box.
const extractWorldBoxDescription = element => {
    const size = getUnrotatedWorldBoxSize(element.getBody());

    // Fall back to the legacy path if there is no measurable geometry.
    if (!size) {
        return extractBoxDescription(element);
    }

    return {
        ...size,
        size: { x: size.width, y: size.height, z: size.length },
        ...extractPositionAndQuaternion(element),
    };
};

export const extractSphereDescription = element => {
    const radius = getWorldBoundingSphereRadius(element.getBody()) ?? element.boundingSphere.radius;

    return {
        radius,
        ...extractPositionAndQuaternion(element),
    };
};

// Static box colliders use the world-space AABB so imported models get
// correctly sized colliders even when their geometry is offset.
export const getBoxDescriptionForElement = element => ({
    ...DEFAULT_BOX_DESCRIPTION,
    ...extractWorldBoxDescription(element),
});

export const getSphereDescriptionForElement = element => ({
    ...DEFAULT_SPHERE_DESCRIPTION,
    ...extractSphereDescription(element),
});

export const getPlayerDescriptionForElement = element => ({
    ...DEFAULT_PLAYER_DESCRIPTION,
    ...extractWorldBoxDescription(element),
});

// Vertices of the element's own geometry, expressed in the frame its compound
// leaf will occupy: translated to `worldCenter` and with `worldQuat` removed —
// the exact frame buildCompoundShape places the shape in, so the hull lines up
// with the visual mesh whatever the element's scale, rotation or nesting.
//
// `excluded` holds the OTHER collider bodies of the compound; their subtrees are
// skipped so a parent's hull doesn't swallow its children (same rule
// measureCollider follows).
//
// Returns a flat [x, y, z, ...] array of hull vertices, or null when the
// geometry can't enclose a volume (fewer than 4 points, or all coplanar) — the
// caller then falls back to a box.
export const extractHullPoints = (body, worldCenter, worldQuat, excluded = new Set()) => {
    body.updateWorldMatrix(true, true);

    // p_leaf = R⁻¹ · (p_world − center)
    const toLeafFrame = new Matrix4()
        .makeRotationFromQuaternion(worldQuat.clone().invert())
        .multiply(new Matrix4().makeTranslation(-worldCenter.x, -worldCenter.y, -worldCenter.z));

    const points = [];
    const vertex = new Vector3();

    const visit = obj => {
        if (obj !== body && excluded.has(obj)) return;

        const position =
            obj.geometry && obj.geometry.attributes && obj.geometry.attributes.position;
        if (position) {
            const matrix = toLeafFrame.clone().multiply(obj.matrixWorld);
            for (let i = 0; i < position.count; i++) {
                points.push(vertex.fromBufferAttribute(position, i).applyMatrix4(matrix).clone());
            }
        }

        for (const child of obj.children) visit(child);
    };
    visit(body);

    // A convex hull needs at least a tetrahedron.
    if (points.length < 4) return null;

    // QuickHull reduces the raw mesh (potentially 100k+ vertices) to just its
    // extreme points — typically tens. Cost is a one-off at body creation.
    // Degenerate/coplanar input leaves faces empty, which we report as null.
    const hull = new ConvexHull().setFromPoints(points);

    const unique = new Map();
    for (const face of hull.faces) {
        let edge = face.edge;
        do {
            const point = edge.head().point;
            unique.set(`${point.x}|${point.y}|${point.z}`, point);
            edge = edge.next;
        } while (edge !== face.edge);
    }

    const flattened = [];
    unique.forEach(point => flattened.push(point.x, point.y, point.z));

    return flattened.length >= 12 ? flattened : null;
};

export const mapColliderTypeToDescription = (colliderType = COLLIDER_TYPES.BOX) =>
    ({
        [COLLIDER_TYPES.BOX]: getBoxDescriptionForElement,
        [COLLIDER_TYPES.SPHERE]: getSphereDescriptionForElement,
        [COLLIDER_TYPES.PLAYER]: getPlayerDescriptionForElement,
    })[colliderType] || getBoxDescriptionForElement;

export const iterateGeometries = (function () {
    const inverse = new Matrix4();

    return function (root, { includeInvisible }, cb) {
        const scale = new Vector3();

        inverse.getInverse(root.matrixWorld);
        scale.setFromMatrixScale(root.matrixWorld);

        root.traverse(mesh => {
            const transform = new Matrix4();

            if (
                mesh.isMesh &&
                (includeInvisible || (mesh.el && mesh.el.object3D.visible) || mesh.visible)
            ) {
                if (mesh === root) {
                    transform.identity();
                } else {
                    mesh.updateWorldMatrix(true);
                    transform.multiplyMatrices(inverse, mesh.matrixWorld);
                }
                // todo: might want to return null xform if this is the root so that callers can avoid multiplying
                // things by the identity matrix
                cb(
                    mesh.geometry.isBufferGeometry
                        ? mesh.geometry.attributes.position.array
                        : mesh.geometry.vertices,
                    transform.elements,
                    mesh.geometry.index ? mesh.geometry.index.array : null,
                );
            }
        });
    };
})();

export const convertAmmoVector = ({ x, y, z }) => ({
    x: z,
    y,
    z: x,
});
