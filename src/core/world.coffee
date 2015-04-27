class World
    constructor: ->
        @entities = {}
        @signalBindings = {}
        @signal = new signals.Signal()
        return

    add: (entity) ->
        {scene, bind} = Wage
        @entities[entity.object.uuid] = entity
        scene.add entity.object
        @signalBindings[entity.object.uuid] = @signal.add entity._update_call, entity
        return

    del: (entity) ->
        {scene, bind} = Wage
        @signalBindings[entity.object.uuid].detach()
        delete @signalBindings[entity.object.uuid]
        delete @entities[entity.object.uuid]
        scene.remove entity.object
        return

    update: ->
        {clock} = Wage
        @signal.dispatch clock.getDelta()
        return

env = self.Wage ?= {}
env.World = World
#env.world = new World()
