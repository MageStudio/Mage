class Camera extends Wage.Entity
    constructor: (@options={}) ->
        super options

    create: ->
        new THREE.PerspectiveCamera @options.fov, @options.ratio, @options.near, @options.far

env = self.Wage ?= {}
env.Camera = Camera
