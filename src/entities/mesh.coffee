class Mesh extends Wage.Entity
    constructor: (@geometry, @material, options={}) ->
        options.shadows ?= {}
        options.shadows.cast ?= true
        options.shadows.receive ?= true
        super options

    create: ->
        mesh = new THREE.Mesh(@geometry, @material)
        mesh.castShadow = @options.shadows.cast
        mesh.receiveShadow = @options.shadows.receive
        mesh

    scale: (x, y, z) ->
        @object.scale.set x, y, z
        return

env = self.Wage ?= {}
env.Mesh = Mesh
