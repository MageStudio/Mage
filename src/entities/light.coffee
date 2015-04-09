class Light extends Wage.Entity
    constructor: (color, options={}) ->
        super options
        @mesh = @object = new THREE.AmbientLight color
        app.add(@mesh, this)

env = self.Wage ?= {}
env.Light = Light
