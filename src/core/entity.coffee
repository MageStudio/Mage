class Entity
    constructor: (@options={}) ->
        @script = null
        for key, val of @options
            # TODO: better injection of script
            if key is "script"
                @script = val
                @addScript val, @options.dir
            else
                this[key] = val
        @_create()
        return this

    _create: ->
        @object = @create()
        if @object isnt null
            {game} = Wage
            game.add this
        return

    create: ->
        null

    remove: ->
        if @object isnt null
            {game} = Wage
            game.del this

    hasScript: ->
        @script isnt null

    start: ->
        # needed?
        return

    _update_call: (dt) ->
        @update dt

    update: ->
        #: implemented by subclassing
        return

    addScript: (script) ->
        {game} = Wage
        obj =
            start: new Function()
            update: new Function()
        for key, val of script
            obj[key] = val
        @_loadScript obj
        return

    _loadScript: (script) ->
        console.log "Entity loading script"
        console.log script
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
