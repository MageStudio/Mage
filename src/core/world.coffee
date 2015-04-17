class World
    constructor: ->
        @entities = {}
        return

    add: (entity) ->
        {scene} = Wage
        @entities[entity.object.uuid] = entity
        scene.add entity.object
        return

    del: (entity) ->
        {scene} = Wage
        delete @entities[entity.object.uuid]
        scene.remove entity.object
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
env.World = World
#env.world = new World()
