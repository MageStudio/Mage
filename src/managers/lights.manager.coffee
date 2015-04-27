class LightsManager
    constructor: ->
        @lights = []
        @delayFactor = 0.1
        @delayStep = 30
        @holderRadius = 0.01
        @holderSegments = 1

    add: (light) ->
        {game} = Wage
        @lights.push(light)
        game.currentScene.refresh()
        return

    #update: ->
    #    {clock} = Wage
    #    t = new Date()
    #    for light in @lights
    #        light.update clock.getDelta()
    #    return

env = self.Wage ?= {}
env.LightsManager = LightsManager
managers = env.managers ?= {}
managers.lights = new LightsManager()
