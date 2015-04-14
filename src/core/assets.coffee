class Assets
    constructor: ->
        @loaded =
            sounds: false
            #images: false
            shaders: false
            #video: false
        return

    load: (callback) ->
        @callback = callback
        {managers} = Wage
        for name, manager of managers
            if manager instanceof Wage.AssetsManager
                manager.loadAssets()
        return

    notifyEnd: (namespace) ->
        @loaded[namespace] = true
        for key, val of @loaded
            if val is false
                return
        @callback()
        return

env = self.Wage ?= {}
env.Assets = Assets
managers = env.managers ?= {}
managers.assets = new Assets()
