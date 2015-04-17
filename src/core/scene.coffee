class Scene
    constructor: ->
        @world = new Wage.World()
        return

    create: ->
        return

    load: ->
        Wage.camera = new Wage.Camera(app.config.camera).object
        @create()
        return

    clear: ->
        entities = @world.entities
        for uuid, entity of entities
            @world.del entity
        return

    exit: ->
        @clear()
        return


env = self.Wage ?= {}
env.Scene = Scene
