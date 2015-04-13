class Game
    constructor: ->
        @directory = "app/scripts/"
        @scripts = {}
        return

    addScript: (name, methods) ->
        obj =
            name: name
            start: new Function()
            update: new Function()
        for key, val of methods
            obj[key] = val
        @scripts[name] = obj
        obj

    _includeScript: (obj, name, path) ->
        scope = this
        script = path + "/" + name
        include(
            script
            ->
                obj._loadScript scope.scripts[name]
                return
        )

env = self.Wage ?= {}
env.Game = Game
env.game = new Game()
