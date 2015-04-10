class Mouse
    constructor: ->
        {@screen, @camera} = Wage
        return

    onWheel: (e) ->
        e.preventDefault()
        @screen.zoom = e.wheelDelta * 0.05
        @camera.position.z += @screen.zoom
        return

    onMove: (e) ->
        @screen.mouse.x = e.clientX - (@screen.w / 2)
        @screen.mouse.y = e.clientY - (@screen.h / 2)
        return

    onTouchStart: (e) ->
        @onTouchMove(e)
        return

    onTouchMove: (e) ->
        if e.thouches.length is 1
            e.preventDefault()
            @screen.mouse.x = e.touches[0].pageX - (@screen.w / 2)
            @screen.mouse.y = e.touches[0].pageY - (@screen.h / 2)
        return

env = self.Wage ?= {}
env.Mouse = Mouse
