class LightManager
    constructor: ->
        lights = []
        @delayFactor = 0.1
        @delayStep = 30
        @holderRadius = 0.01
        holderSegments = 1

    add: (light) ->
        @lights.push(light)
        return

    update: ->
        t = new Date()
        for light in @lights
            light.update app.clock.getDelta()
            #: prevent loop to take > 50 msecs
            dt = new Date()
            if dt - start > 50
                break
        return

env = self.Wage ?= {}
env.LightManager = LightManager
managers = env.managers ?= {}
managers.lights = new LightManager()
