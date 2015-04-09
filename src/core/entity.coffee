class Entity
    constructor: (@options={}) ->
        @script = null
        for key, val of @options
            if val is "script"
                @script = val
                # TODO: better injection of script
            else
                this[key] = val
        @_create()
        return this

    _create: ->
        @object = @create()
        if @object isnt null
            app.add(@object, this)
        return

    create: ->
        return null

    hasScript: ->
        @script isnt null

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
