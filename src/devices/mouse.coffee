class Mouse
    constructor: (control) ->
        @signals =
            move: new signals.Signal()
            wheel: new signals.Signal()
            up: new signals.Signal()
            down: new signals.Signal()
        {bind} = Wage
        control.handler.domElement.addEventListener 'mousemove', bind(this, this.onMove), false
        control.handler.domElement.addEventListener 'mousewheel', bind(this, this.onWheel), false
        control.handler.domElement.addEventListener 'mouseup', bind(this, this.onUp), false
        control.handler.domElement.addEventListener 'mousedown', bind(this, this.onDown), false

    onMove: (e) ->
        {screen} = Wage
        screen.mouse.x = e.clientX - (screen.w / 2)
        screen.mouse.y = e.clientY - (screen.h / 2)
        @signals.move.dispatch e
        return

    onWheel: (e) ->
        e.preventDefault()
        #@screen.zoom = e.wheelDelta * 0.05
        #@camera.position.z += @screen.zoom
        @signals.wheel.dispatch e
        return

    onUp: (e) ->
        @signals.up.dispatch e
        return

    onDown: (e) ->
        @signals.down.dispatch e
        return

    #onTouchStart: (e) ->
    #    @onTouchMove(e)
    #    return

    #onTouchMove: (e) ->
    #    if e.thouches.length is 1
    #        e.preventDefault()
    #        @screen.mouse.x = e.touches[0].pageX - (@screen.w / 2)
    #        @screen.mouse.y = e.touches[0].pageY - (@screen.h / 2)
    #    return

env = self.Wage ?= {}
env.Mouse = Mouse
