class Control
    constructor: ->
        {app} = Wage
        @devices = {}
        #: create control handler
        @handler = new app.config.controller this
        #: create device handlers
        for key, val of app.config.handlers
            @devices[key] = new val this
        #: bind the listeners
        @handler._bind()

    update: ->
        {clock} = Wage
        @handler.update clock.getDelta()
        return

env = self.Wage ?= {}
env.Control = Control
