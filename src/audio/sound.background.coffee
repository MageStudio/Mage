class BackgroundSound extends Wage.Sound
    _init: (options) ->
        @source.loop = options.loop or true
        return

env = self.Wage ?= {}
env.BackgroundSound = BackgroundSound
