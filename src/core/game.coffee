class Game
    constructor: ->
        @scenes = {}
        @currentScene = null
        @create()
        return

    create: ->
        @scenes.main = new Wage.Scene()
        return

    loadScene: (name="main") ->
        if @currentScene
            @currentScene.exit()
        scene = @scenes[name]
        @currentScene = scene
        scene.load()
        return

    add: (mesh, entity) ->
        @currentScene.env.add mesh
        @currentScene.world.add mesh.uuid, entity
        return

    del: (mesh) ->
        @currentScene.env.remove mesh
        @currentScene.world.del mesh.uuid
        return

    update: ->
        @currentScene.world.update()

env = self.Wage ?= {}
env.Game = Game
