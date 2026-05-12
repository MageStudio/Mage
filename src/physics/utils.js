import { Box3, Matrix4, Vector3 } from "three";
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

// World-space AABB path — uses Box3.setFromObject() to compute the full
// bounding box of the entire object hierarchy including child transforms.
// More accurate for imported models whose geometry may be offset from the
// element origin, but can produce unexpected results for complex hierarchies.
const extractWorldBoxDescription = element => {
    const size = getWorldBoundingBoxSize(element.getBody());

    // Fall back to the legacy path if the world box is degenerate.
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
