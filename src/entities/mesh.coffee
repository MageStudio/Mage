class Mesh extends Wage.Entity
    constructor: (@geometry, @material, options={}) ->
        super options

    create: ->
        new THREE.Mesh(@geometry, @material)

    scale: (x, y, z) ->
        @object.scale.set x, y, z
        return

env = self.Wage ?= {}
env.Mesh = Mesh
