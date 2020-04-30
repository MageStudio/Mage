const DEFAULT_BOX_DESCRIPTION = {
    type: 'box',
    move: true,
    density: 1,
    size: [ 2, 2, 2 ],
    pos: [ 0, 0, 0 ],
};

export const getDescriptionForMesh = mesh => {
    const { boundingBox } = mesh;
    const { x, y, z } = mesh.position();
    const rotation = mesh.rotation();
    const { x: sizeX, y: sizeY, z:sizeZ } = boundingBox.getSize();

    if (boundingBox) {
        return {
            type: 'box',
            move: true,
            density: 1,
            size: [ sizeX, sizeY, sizeZ ],
            pos: [ x, y, z ],
            //rot: [ rotation.x, rotation.y, rotation.z ]
        };
    }

    return DEFAULT_BOX_DESCRIPTION;
}
