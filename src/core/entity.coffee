class Entity
    start: ->
        return

    update: ->
        return

    addScript: (name, dir) ->
        return

    _loadScript: (script) ->
        return

    addSound: (name, options={}) ->
        return

    addDirectionalSound: (name, options={}) ->
        return

    addAmbientSound: (name, options={}) ->
        return

    addMesh: (mesh) ->
        return

    addLight: (color, intensity, distance) ->
        return

    playSound: ->
        return

    stopSound: ->
        return

    scale: (x, y, z) ->
        return

env = self.Wage ?= {}
env.Entity = Entity
