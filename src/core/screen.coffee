class Screen
    contructor: ->
        @set()
        return

    set: ->
        @w = window.innerWidth
        @h = window.innerHeight
        @ratio = @w/@h
        return

env = self.Wage ?= {}
#env.Screen = Screen
env.screen = new Screen()
