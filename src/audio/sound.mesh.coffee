class MeshSound extends Wage.Sound
    constructor: (name, @mesh, options={}) ->
        super name, options

    update: (dt) ->
        before = new THREE.Vector3()
        before.setFromMatrixPosition @mesh.matrixWorld
        @mesh.updateMatrixWorld()
        after = new THREE.Vector3()
        after.setFromMatrixPosition @mesh.matrixWorld
        dx = after.x - before.x
        dy = after.y - before.y
        dz = after.z - before.z
        @panner.setPosition after.x, after.y, after.z
        @panner.setVelocity dx/dt, dy/dt, dz/dt
        return

env = self.Wage ?= {}
env.MeshSound = MeshSound
