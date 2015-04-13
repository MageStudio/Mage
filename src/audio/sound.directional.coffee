class DirectionalSound extends Wage.MeshSound
    constructor: (name, mesh, @angles, options) ->
        super name, mesh, options

    _init: (options) ->
        @panner.coneInnerAngle = angles.innerAngleDegrees
        @panner.coneOuterAngle = angles.outerAngleDegrees
        @panner.coneOuterGain = angles.outerGainFactor
        return

    update: (dt) ->
        super dt
        matrix = @mesh.matrixWorld
        mx = matrix.elements[12]
        my = matrix.elements[13]
        mz = matrix.elements[14]
        for i in [12..14]
            matrix.elements[i] = 0
        #: multiply orientation vector
        vec = new THREE.Vector3 0, 0, 1
        vec.applyProjection matrix
        vec.normalize()
        @panner.setOrientation vec.x, vec.y, vec.z
        matrix.elements[12] = mx
        matrix.elements[13] = my
        matrix.elements[14] = mz
        return

env = self.Wage ?= {}
env.DirectionalSound = DirectionalSound
