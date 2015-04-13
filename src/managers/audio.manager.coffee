class AudioManager extends Wage.AssetsManager
    constructor: ->
        super
        @namespace = "audio"
        @config =
            volume: 80
            delayFactor: 0.02
            delayMaxTo: 40
            delayMinTo: 0.2
            delayStep: 1
        context = window.AudioContext or window.webkitAudioContext
        if context
            @context = new context()
        @volume = @context.createGain()
        @volume.gain.value = @config.volume
        @volume.connect(@context.destination)

    _loadFile: (name, path) ->
        scope = this
        request = new XMLHttpRequest()
        request.open "GET", path, true
        request.responseType = "arraybuffer"
        request.onload = ->
            scope.context.decodeAudioData(
                @response
                onSuccess = (buffer) ->
                    @data[name] = buffer
                    return
                onFailure = ->
                    @data[name] = null
                    return
            )
            return
        request.send()
        @_loadCallback name
        return

    update: ->
        {clock, camera} = Wage
        t = new Date()
        for name, sound of @data
            sound.update clock.getDelta()
            camera.updateMatrixWorld()
            position = new THREE.Vector3()
            position.setFromMatrixPosition camera.matrixWorld
            #: set audio context listener position to the camera one
            @context.listener.setPosition position.x, position.y, position.z
            #: up and down vectors to camera
            matrix = camera.matrix
            mx = matrix.elements[12]
            my = matrix.elements[13]
            mz = matrix.elements[14]
            for i in [12..14]
                matrix.elements[i] = 0
            #: multiply orientation vectors by the camera world matrix
            down = new THREE.Vector3 0, 0, 1
            down.applyProjection matrix
            down.normalize()
            up = new THREE.Vector3 0, -1, 0
            up.applyProjection matrix
            up.normalize
            #: set orientation vectors to the listener
            @context.listener.setOrientation down.x, down.y, down.z, up.x, up.y, up.z
            matrix.elements[12] = mx
            matrix.elements[13] = my
            matrix.elements[14] = mz
            #: prevent loop to take > 50 msecs
            dt = new Date()
            if dt - start > 50
                break
        return

env = self.Wage ?= {}
env.AudioManager = AudioManager
managers = env.managers ?= {}
managers.audio = new AudioManager()
