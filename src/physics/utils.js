import { Matrix4, Vector3 } from 'three';

import { getSphereVolume } from '../lib/math';

import { BOUNDINGBOX_NOT_AVAILABLE } from '../lib/messages';
import { DEFAULT_QUATERNION, DEFAULT_POSITION } from './constants';
import { PHYSICS_COLLIDER_TYPES } from './constants';

export const DEFAULT_DESCRIPTION = {
    mass: 1,
    friction: 1,
    quaternion: DEFAULT_QUATERNION,
    position: DEFAULT_POSITION
}

const DEFAULT_BOX_DESCRIPTION = {
    ...DEFAULT_DESCRIPTION,
    width: 2,
    length: 2,
    height: 2,
    collider: PHYSICS_COLLIDER_TYPES.BOX
};

const DEFAULT_SPHERE_DESCRIPTION = {
    ...DEFAULT_DESCRIPTION,
    radius: 2,
    collider: PHYSICS_COLLIDER_TYPES.SPHERE
};

export const extractBoundingBox = body => {
    body.geometry.computeBoundingBox();
    return body.geometry.boundingBox;
};

export const extractBiggestBoundingBox = body => {
    const boxes = [];
    body.traverse(child => {
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

        return ((vectorB.x * vectorB.y * vectorB.z) - (vectorA.x * vectorA.y * vectorA.z));
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
    return spheres.sort((sphereA, sphereB) => getSphereVolume(sphereB.radius) - getSphereVolume(sphereA.radius))[0];
};

export const parseBoundingBoxSize = (boundingBox = {}) => {
    try {
        const size = new Vector3();
        boundingBox.getSize(size);

        const { x: sizeX, y: sizeY, z: sizeZ } = size;

        return {
            x: sizeX,
            y: sizeY,
            z: sizeZ
        }
    } catch(e) {
        console.log(BOUNDINGBOX_NOT_AVAILABLE);
        return {
            x: 1,
            y: 1,
            z: 1
        }
    }
};

const extractBoxDescription = element => {
    const { x, y, z } = element.getPosition();
    const scale = element.getScale();
    const quaternion = element.getQuaternion();
    const size = parseBoundingBoxSize(element.boundingBox);

    return {
        width: size.z * scale.z,
        height: size.y * scale.y,
        length: size.x * scale.x,
        size,
        position: { x: z, y, z: x },
        quaternion: { x: quaternion.z, y: quaternion.y, z: quaternion.x, w: quaternion.w }
    };
};

const extractSphereDescription = element => {
    const { x, y, z } = element.getPosition();
    // const scale = element.getScale();
    const quaternion = element.getQuaternion();
    const radius = element.boundingSphere.radius;
    
    return {
        radius,
        position: { x: z, y, z: x },
        quaternion: { x: quaternion.z, y: quaternion.y, z: quaternion.x, w: quaternion.w }
    }
}

export const getBoxDescriptionForElement = element => ({
    ...DEFAULT_BOX_DESCRIPTION,
    ...extractBoxDescription(element)
});

export const getSphereDescriptionForElement = element => ({
    ...DEFAULT_SPHERE_DESCRIPTION,
    ...extractSphereDescription(element)
});

export const mapColliderTypeToDescription = (colliderType = PHYSICS_COLLIDER_TYPES.BOX) => ({
    [PHYSICS_COLLIDER_TYPES.BOX]: getBoxDescriptionForElement,
    [PHYSICS_COLLIDER_TYPES.SPHERE]: getSphereDescriptionForElement
}[colliderType] || getBoxDescriptionForElement)

export const iterateGeometries = (function() {
    const inverse = new Matrix4();

    return function(root, { includeInvisible }, cb) {
        const scale = new Vector3();

        inverse.getInverse(root.matrixWorld);
        scale.setFromMatrixScale(root.matrixWorld);

        root.traverse(mesh => {
            const transform = new Matrix4();

            if (mesh.isMesh && (includeInvisible || (mesh.el && mesh.el.object3D.visible) || mesh.visible)) {
                if (mesh === root) {
                    transform.identity();
                } else {
                    mesh.updateWorldMatrix(true);
                    transform.multiplyMatrices(inverse, mesh.matrixWorld);
                }
                // todo: might want to return null xform if this is the root so that callers can avoid multiplying
                // things by the identity matrix
                cb(
                    mesh.geometry.isBufferGeometry ? mesh.geometry.attributes.position.array : mesh.geometry.vertices,
                    transform.elements,
                    mesh.geometry.index ? mesh.geometry.index.array : null
                );
            }
        });
    };
})();

export const convertAmmoVector = ({ x, y, z }) => ({
    x: z,
    y,
    z: x
});