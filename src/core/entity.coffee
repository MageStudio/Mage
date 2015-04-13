class Entity
    constructor: (@options={}) ->
        {@app} = Wage
        @script = null
        for key, val of @options
            # TODO: better injection of script
            if val is "script"
                @script = val
                @addScript val, @options.dir
            else
                this[key] = val
        @_create()
        return this

    _create: ->
        @object = @create()
        if @object isnt null
            @app.add @object, this
        return

    create: ->
        null

    hasScript: ->
        @script isnt null

    start: ->
        # needed?
        return

    update: ->
        #: implemented by subclassing
        return

    addScript: (name, dir) ->
        {game} = Wage
        path = game.dir + (dir or "")
        if path[path.length-1] isnt "/"
            path += "/"
        game._includeScript this, name, path
        return

    _loadScript: (script) ->
        for key, val of script
            this[key] = val
        try
            @start()
        catch e
            {app} = Wage
            app.log 'e', "Something wrong with script start() method"
        return

    # TODO
    #addSound: (name, options={}) ->
    #    return
    #addDirectionalSound: (name, options={}) ->
    #    return
    #addAmbientSound: (name, options={}) ->
    #    return
    #addLight: (color, intensity, distance) ->
    #    return
    #playSound: ->
    #    return
    #stopSound: ->
    #    return

env = self.Wage ?= {}
env.Entity = Entity
