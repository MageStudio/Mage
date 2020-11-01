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
        const { x: sizeX, y: sizeY, z: sizeZ } = boundingBox.getSize();
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

export const getDescriptionForElement = element => {
    const { x, y, z } = element.getPosition();
    const quaternion = element.getQuaternion();
    const size = parseBoundingBoxSize(element.boundingBox);

    return {
        ...DEFAULT_BOX_DESCRIPTION,
        width: size.z,
        height: size.y,
        length: size.x,
        size,
        position: { x, y, z },
        quaternion: { x: quaternion.x, y: quaternion.y, z: quaternion.z, w: quaternion.w }
    };
}
