class Mouse
    constructor: (@app) ->
        return

    onWheel: (e) ->
        e.preventDefault()
        return

    onMove: (e) ->
        return

    onTouchStart: (e) ->
        return

    onTouchMove: (e) ->
        return

env = self.Wage ?= {}
env.Mouse = Mouse
