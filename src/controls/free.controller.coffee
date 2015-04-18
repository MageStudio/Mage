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

    keydownShift: ->
        @movementSpeedMultiplier = 1

    keydownW: ->
        @state.forward = 1

    keyupW: ->
        @state.forward = 0

    keydownA: ->
        @state.left = 1

    keyupA: ->
        @state.left = 0

    keydownS: ->
        @state.back = 1

    keyupS: ->
        @state.back = 0

    keydownD: ->
        @state.right = 1

    keyupD: ->
        @state.right = 0

    keydownR: ->
        @state.up = 1

    keyupR: ->
        @state.up = 0

    keydownF: ->
        @state.down = 1

    keyupF: ->
        @state.down = 0

    keydownUp: ->
        @state.pitchUp = 1

    keyupUp: ->
        @state.pitchUp = 0

    keydownDown: ->
        @state.pitchDown = 1

    keyupDown: ->
        @state.pitchDown = 0

    keydownLeft: ->
        @state.yawLeft = 1

    keyupLeft: ->
        @state.yawLeft = 0

    keydownRight: ->
        @state.yawRight = 1

    keyupRight: ->
        @state.yawRight = 0

    keydownQ: ->
        @state.rollLeft = 1

    keyupQ: ->
        @state.rollLeft = 0

    keydownE: ->
        @state.rollRight = 1

    keyupE: ->
        @satte.rollRight = 0

    onKey: ->
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
            {w, h, woffset, hoffset} = @getContainerDimensions()
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
