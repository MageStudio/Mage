class Light extends Wage.Entity
    constructor: (@color, @intensity, position=null, options={}) ->
        if position is null
            position =
                x: 0
                y: 0
                z: 0
        @position = position
        @isOn = false
        super options

    create: ->
        Wage.managers.lights.add(this)
        null

    on: ->
        return

    off: ->
        return

env = self.Wage ?= {}
env.Light = Light
