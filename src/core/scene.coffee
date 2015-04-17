class Scene
    constructor: ->
        @env = null
        return

    create: ->
        return

    load: ->
        {app} = Wage
        if app._physics
            @env = new Physijs.Scene()
        else
            @env = new THREE.Scene()
        @world = new Wage.World()
        Wage.scene = @env
        Wage.camera = new Wage.Camera(app.config.camera).object
        @create()
        return

    exit: ->
        delete @env
        return


env = self.Wage ?= {}
env.Scene = Scene
