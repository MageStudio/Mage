class Mesh extends Wage.Entity
    constructor: (@geometry, @material, options={}) ->
        super options

    create: ->
        new THREE.Mesh(@geometry, @material)

env = self.Wage ?= {}
env.Mesh = Mesh
