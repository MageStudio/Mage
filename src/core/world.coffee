class World
    constructor: ->
        @entities = {}
        return

    update: ->
        {clock} = Wage
        keys = Object.keys(@entities)
        t = new Date()
        while keys.length
            obj = @entities[keys.shift()]
            if obj.update
                obj.update clock.getDelta()
            #: prevent loop to take > 50 msecs
            dt = new Date()
            if dt - t > 50
                break
        return

env = self.Wage ?= {}
#env.World = World
env.world = new World()
