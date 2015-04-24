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

    add: (entity) ->
        @currentScene.world.add entity
        return

    del: (entity) ->
        @currentScene.world.del mesh.uuid
        return

    update: ->
        @currentScene.world.update()

env = self.Wage ?= {}
env.Game = Game
