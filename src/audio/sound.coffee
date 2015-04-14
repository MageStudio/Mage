class Sound
    constructor: (@name, options={}) ->
        {@audio} = Wage.managers
        @callbacks =
            onEnd: options.onEnd or new Function()
            onLoopStart: options.onLoopStart or new Function()
            onLoopEnd: options.onLoopEnd or new Function()
        @volume = @audio.context.createGain()
        @source = @audio.context.createBufferSource()
        @reset()
        @panner = @audio.context.createPanner()
        @volume.connect @panner
        if options.effects
            @convolver = @audio.context.createConvolver()
            @mixer = @audio.context.createGain()
            @panner.connect @mixer
            @gains =
                plain: @audio.context.createGain()
                convolver: @audio.context.createGain()
            @mixer.connect @gains.plain
            @mixer.connect @gains.convolver
            @gains.plain.connect @audio.volume
            @gains.convolver.connect @audio.volume
            @convolver.buffer = @audio.get options.effect
            @gains.convolver.gain.value = 0.7
            @gains.plain.gain.value = 0.3
        else
            @panner.connect @audio.volume
        @_init options
        @audio.add this
        autoplay = options.autoplay or false
        if autoplay
            @start()
        return

    _init: (options) ->
        return

    _setListeners: ->
        {bind} = Wage
        @source._caller = this
        @source.onended = bind this, @onEnd
        @source.loopEnd = bind this, @onLoopEnd
        @source.loopStart = bind this, @onLoopStart
        return

    onEnd: ->
        return @callbacks.onEnd()

    onLoopStart: ->
        return @callbacks.onLoopStart()

    onLoopEnd: ->
        return @callbacks.onLoopEnd()

    start: ->
        scope = this
        buffer = @audio.get @name
        if not buffer
            return
        @source.buffer = buffer
        @volume.gain.value = 0
        @source.start @audio.context.currentTime
        _delay = ->
            scope.volume.gain.value += scope.audio.config.delayFactor
            if scope.volume.gain.value < scope.audio.config.delayMaxTo
                setTimeout _delay, scope.audio.config.delayStep
            return
        _delay()
        return

    stop: ->
        scope = this
        _delay = ->
            scope.volume.gain.value -= scope.audio.config.delayFactor
            if scope.volume.gain.value > scope.audio.config.delayMinTo
                setTimeout _delay, scope.audio.config.delayStep
            else
                scope.source.stop()
            return
        _delay()
        return

    reset: ->
        @source.disconnect()
        @source = @audio.context.createBufferSource()
        @_setListeners()
        @volume.gain.value = @audio.config.volume
        @source.connect @volume
        return

    update: (dt) ->
        return

env = self.Wage ?= {}
env.Sound = Sound
