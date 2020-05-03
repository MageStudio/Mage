const DEFAULT_BOX_DESCRIPTION = {
    type: 'box',
    move: true,
    density: 1,
    size: [ 2, 2, 2 ],
    pos: [ 0, 0, 0 ],
};

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

export const getDescriptionForMesh = mesh => {
    const { x, y, z } = mesh.getWorldPosition();
    const rotation = mesh.getRotation();
    const { boundingBox } = mesh;
    const size = parseBoundingBoxSize(boundingBox);

    return {
        ...DEFAULT_BOX_DESCRIPTION,
        size: [ size.x, size.y, size.z ],
        pos: [ x, y, z ],
        rot: [ rotation.x, rotation.y, rotation.z ]
    };
}
