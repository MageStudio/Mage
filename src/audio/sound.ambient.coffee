class AmbientSound extends Wage.MeshSound
    _init: (options) ->
        @source.loop = options.loop or false
        return

    update: (dt) ->
        @mesh.updateMatrixWorld()
        position = new THREE.Vector3()
        position.setFromMatrixPosition @mesh.matrixWorld
        @panner.setPosition position.x, position.y, position.z
        return

env = self.Wage ?= {}
env.AmbientSound = AmbientSound
