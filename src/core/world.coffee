class World
    constructor: ->
        @entities = {}
        return

    update: ->
        keys = Object.keys(@entities)
        t = new Date()
        while keys
            obj = @entities[keys.shift()]
            if obj.update
                obj.update(app.clock.getDelta())
            #: prevent loop to take > 50 msecs
            dt = new Date()
            if dt - start > 50
                break
        return

env = self.Wage ?= {}
env.World = World
