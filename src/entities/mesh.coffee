class Mesh extends Wage.Entity
    constructor: (@geometry, @material, options={}) ->
        super options
        @mesh = @object = new THREE.Mesh(geometry, material)
        app.add(@mesh, this)

env = self.Wage ?= {}
env.Mesh = Mesh
