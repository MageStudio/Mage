class FreeController extends Wage.Controller
    constructor: (options={}, domElement=document) ->
        @_defaults =
            movementSpeed: 1.0
            rollSpeed: 0.5
            dragToLook: false
            autoForward: false
        super options, domElement
        @speed =
            movement: @config.movementSpeed
            roll: @config.rollSpeed
        {@dragToLook, @autoForward} = @config
        @mouseStatus = 0
        @state =
            up: 0
            down: 0
            left: 0
            right: 0
            forward: 0
            back: 0
            pitchUp: 0
            pitchDown: 0
            yawLeft: 0
            yawRight: 0
            rollLeft: 0
            rollRight: 0
        @vectors =
            move: new THREE.Vector3 0, 0, 0
            rotation: new THREE.Vector3 0, 0, 0
        return

    #handleEvent: (e) ->
    #    if typeof this[e.type] is 'function'
    #        this[e.type](e)
    #    return

    updateMovementVector: ->
        forward = if @state.forward or (@autoForward and not @state.back) then 1 else 0
        @vectors.move.x = - @state.left + @state.right
        @vectors.move.y = - @state.down + @state.up
        @vectors.move.z = - forward + @state.back
        return

    updateRotationVector: ->
        @vectors.rotation.x = - @state.pitchDown + @state.pitchUp
        @vectors.rotation.y = - @state.yawRight + @state.yawLeft
        @vectors.rotation.z = - @state.rollRight + @state.rollLeft
        return

    getContainerDimensions: ->
        if @domElement isnt document
            rv =
                w: @domElement.offsetWidth
                h: @domElement.offsetHeight
                woffset: @domElement.offsetLeft
                hoffset: @domElement.offsetTop
        else
            rv =
                w: window.innerWidth
                h: window.innerHeight
                woffset: 0
                hoffset: 0
        rv

    keydown: (e) ->
        if e.altKey
            return
        switch e.keyCode
            # shift
            when 16 then @movementSpeedMultiplier = 1
            # w
            when 87 then @state.forward = 1
            # s
            when 83 then @state.back = 1
            # a
            when 65 then @state.left = 1
            # d
            when 68 then @state.right = 1
            # r
            when 82 then @state.up = 1
            # f
            when 70 then @state.down = 1
            # arrow up
            when 38 then @state.pitchUp = 1
            # arrow down
            when 40 then @state.pitchDown = 1
            # arrow left
            when 37 then @state.yawLeft = 1
            # arrow right
            when 39 then @state.yawRight = 1
            # q
            when 81 then @state.rollLeft = 1
            # e
            when 69 then @state.rollRight = 1
        @updateMovementVector()
        @updateRotationVector()
        return

    keyup: (e) ->
        switch e.keyCode
            # shift
            when 16 then @movementSpeedMultiplier = 1
            # w
            when 87 then @state.forward = 0
            # s
            when 83 then @state.back = 0
            # a
            when 65 then @state.left = 0
            # d
            when 68 then @state.right = 0
            # r
            when 82 then @state.up = 0
            # f
            when 70 then @state.down = 0
            # arrow up
            when 38 then @state.pitchUp = 0
            # arrow down
            when 40 then @state.pitchDown = 0
            # arrow left
            when 37 then @state.yawLeft = 0
            # arrow right
            when 39 then @state.yawRight = 0
            # q
            when 81 then @state.rollLeft = 0
            # e
            when 69 then @state.rollRight = 0
        @updateMovementVector()
        @updateRotationVector()
        return

    mousedown: (e) ->
        if @domElement isnt document
            @domElement.focus()
        e.preventDefault()
        e.stopPropagation()
        if @dragToLook
            @mouseStatus += 1
        else
            switch e.button
                when 0 then @state.forward = 1
                when 2 then @state.back = 1
        @updateMovementVector()
        return

    mousemove: (e) ->
        if not @dragToLook or @mouseStatus > 0
            {w, h, woffset, hoffset} = @getContainerDimensions
            @state.yawLeft = - (e.pageX - woffset - w/2) / (w/2) * 3
            @state.pitchDown = (e.pageY - hoffset - h/2) / (h/2) * 3
            @updateRotationVector()
        return

    mouseup: (e) ->
        e.preventDefault()
        e.stopPropagation()
        if @dragToLook
            @mouseStatus -= 1
            @state.yawLeft = @state.pitchDown = 0
        else
            switch e.button
                when 0 then @state.forward = 0
                when 2 then @state.back = 0
            @updateMovementVector()
        @updateRotationVector()
        return

    update: (dt) ->
        {camera} = Wage
        alphaMove = dt * @speed.movement
        alphaRotate = dt * @speed.roll
        camera.translateX @vectors.move.x * alphaMove
        camera.translateY @vectors.move.y * alphaMove
        camera.translateZ @vectors.move.z * alphaMove
        quaternion = new THREE.Quaternion @vectors.rotation.x * alphaRotate, @vectors.rotation.y * alphaRotate, @vectors.rotation.z * alphaRotate
        quaternion.normalize()
        camera.quaternion.multiply quaternion
        camera.rotation.setFromQuaternion quaternion, camera.rotation.order
        return

env = self.Wage ?= {}
env.FreeController = FreeController
