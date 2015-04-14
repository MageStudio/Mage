class Controller
    constructor: (@options={}, @domElement=document) ->
        if @domElement isnt document
            @domElement.setAttribute 'tabindex', -1
        @config = {}
        @_defaults = @_defaults or options
        @_loadConfig()
        @bindable = ['keydown', 'keyup', 'mousedown', 'mouseup', 'mousemove']
        @addListeners()
        return

    _loadConfig: ->
        for key, val of @_defaults
            if @options[key] isnt undefined
                val = @options[key]
            @config[key] = val
        return

    addListeners: ->
        @domElement.addEventListener(
            'contextmenu'
            (e) ->
                e.preventDefault()
                return
            false
        )
        {bind} = Wage
        for key in @bindable
            if this[key] isnt undefined
                @domElement.addEventListener key, bind(this, this[key]), false
        return

    update: (dt) ->
        return

env = self.Wage ?= {}
env.Controller = Controller
