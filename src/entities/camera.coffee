class Camera extends Wage.Entity
    constructor: (@options={}) ->
        super options

    create: ->
        rv = new THREE.PerspectiveCamera @options.fov, @options.ratio, @options.near, @options.far
        rv.entity = this
        rv

env = self.Wage ?= {}
env.Camera = Camera
