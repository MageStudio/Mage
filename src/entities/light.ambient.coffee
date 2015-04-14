class AmbientLight extends Wage.Light
    create: ->
        super
        new THREE.AmbientLight @color

env = self.Wage ?= {}
env.AmbientLight = AmbientLight
