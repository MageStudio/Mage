export const evaluateCameraPosition = camera => {
    //now handling listener
    camera.updateMatrixWorld();
    const position = new Vector3();
    position.setFromMatrixPosition(camera.matrixWorld);

    //this is to add up and down vector to our camera
    // The camera's world matrix is named "matrix".
    const m = camera.matrix;

    const mx = m.elements[12], my = m.elements[13], mz = m.elements[14];
    m.elements[12] = m.elements[13] = m.elements[14] = 0;

    // Multiply the orientation vector by the world matrix of the camera.
    const orientation = new Vector3(0, 0, 1);
    orientation.applyMatrix4(m);
    orientation.normalize();

    // Multiply the up vector by the world matrix.
    const up = new Vector3(0, -1, 0);
    up.applyMatrix4(m);
    up.normalize();

    m.elements[12] = mx;
    m.elements[13] = my;
    m.elements[14] = mz;

    return {
        position,
        orientation,
        up
    };
}