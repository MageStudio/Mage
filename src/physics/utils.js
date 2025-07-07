import { Matrix4, Vector3 } from "three";
import { PHYSICS_EVENTS } from "./messages";

import { getSphereVolume } from "../lib/math";

import { BOUNDINGBOX_NOT_AVAILABLE } from "../lib/messages";
import { DEFAULT_QUATERNION, DEFAULT_POSITION } from "./constants";
import { COLLIDER_TYPES } from "./constants";

export const DEFAULT_DESCRIPTION = {
    mass: 1,
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

export const mapColliderTypeToAddEvent = type =>
    ({
        [COLLIDER_TYPES.BOX]: PHYSICS_EVENTS.ADD.BOX,
        [COLLIDER_TYPES.VEHICLE]: PHYSICS_EVENTS.ADD.VEHICLE,
        [COLLIDER_TYPES.PLAYER]: PHYSICS_EVENTS.ADD.PLAYER,
        [COLLIDER_TYPES.SPHERE]: PHYSICS_EVENTS.ADD.SPHERE,
    }[type] || PHYSICS_EVENTS.ADD.BOX);

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
    const spheres = [];
    body.traverse(child => {
        if (child.geometry) {
            spheres.push(extractBoundingBox(child));
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
    } catch (e) {
        console.log(BOUNDINGBOX_NOT_AVAILABLE);
        return {
            x: 1,
            y: 1,
            z: 1,
        };
    }
};

export const extractPositionAndQuaternion = element => {
    const { x, y, z } = element.getPosition();
    const quaternion = element.getQuaternion();

    return {
        position: { x, y, z },
        quaternion: { x: quaternion.x, y: quaternion.y, z: quaternion.z, w: quaternion.w },
    };
};

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

export const extractSphereDescription = element => {
    const radius = element.boundingSphere.radius;

    return {
        radius,
        ...extractPositionAndQuaternion(element),
    };
};

export const getBoxDescriptionForElement = element => ({
    ...DEFAULT_BOX_DESCRIPTION,
    ...extractBoxDescription(element),
});

export const getSphereDescriptionForElement = element => ({
    ...DEFAULT_SPHERE_DESCRIPTION,
    ...extractSphereDescription(element),
});

export const mapColliderTypeToDescription = (colliderType = COLLIDER_TYPES.BOX) =>
    ({
        [COLLIDER_TYPES.BOX]: getBoxDescriptionForElement,
        [COLLIDER_TYPES.SPHERE]: getSphereDescriptionForElement,
    }[colliderType] || getBoxDescriptionForElement);

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
