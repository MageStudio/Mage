class Screen
    constructor: ->
        @zoom = 0
        @mouse =
            x: 0
            y: 0
        @set()
        return

    set: ->
        @w = window.innerWidth
        @h = window.innerHeight
        @ratio = @w/@h
        return

env = self.Wage ?= {}
env.screen = new Screen()
