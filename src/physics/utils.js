import { Matrix4, Vector3 } from 'three';

import { BOUNDINGBOX_NOT_AVAILABLE } from '../lib/messages';
const DEFAULT_BOX_DESCRIPTION = {
    mass: 1,
    friction: 1,
    width: 2,
    length: 2,
    height: 2,
    quaternion: { x : 0, y: 0, z: 0, w: 1 },
    position: { x: 0, y: 0, z: 0 }
};

export const extractBoundingBox = body => {
    body.geometry.computeBoundingBox();
    return body.geometry.boundingBox;
}

export const extractBiggestBoundingBox = body => {
    const boxes = [];
    body.traverse(child => {
        if (child.geometry) {
            boxes.push(extractBoundingBox(child));
        }
    });

    // sorting by volume
    const sorted = boxes.sort((boxA, boxB) => {
        const sizeA = boxA.getSize();
        const sizeB = boxB.getSize();

        return ((sizeB.x * sizeB.y * sizeB.z) - (sizeA.x * sizeA.y * sizeA.z));
    });

    return sorted[0];
}

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

export const getBaseDescriptionForElement = element => {
    const { x, y, z } = element.getPosition();
    const quaternion = element.getQuaternion();
    const size = parseBoundingBoxSize(element.boundingBox);

    return {
        width: size.z,
        height: size.y,
        length: size.x,
        size,
        position: { x, y, z },
        quaternion: { x: quaternion.x, y: quaternion.y, z: quaternion.z, w: quaternion.w }
    }
}

export const getBoxDescriptionForElement = element => ({
    ...DEFAULT_BOX_DESCRIPTION,
    ...getBaseDescriptionForElement(element)
});

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