class Control
    constructor: ->
        {app} = Wage
        @handler = new app.config.controller()
        return

    update: ->
        {clock} = Wage
        handler.update clock.getDelta()
        return

env = self.Wage ?= {}
env.Control = Control
