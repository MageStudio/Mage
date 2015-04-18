class Controller
    constructor: (@control, @options={}, @domElement=document) ->
        if @domElement isnt document
            @domElement.setAttribute 'tabindex', -1
        @config = {}
        @_defaults = @_defaults or options
        @_loadConfig()
        return

    _loadConfig: ->
        for key, val of @_defaults
            if @options[key] isnt undefined
                val = @options[key]
            @config[key] = val
        return

    _getListeners: ->
        #: load all the methods in the class that are allowed to bind actions
        #methods = Object.getOwnPropertyNames @prototype
        rv =
            keyboard:
                down: {}
                up: {}
            mouse: {}
        mouseBinds = ['mousemove', 'mousedown', 'mouseup']
        for method, f of @__proto__
            if method[0...'keydown'.length] is 'keydown'
                mkey = method['keydown'.length..]
                rv.keyboard.down[mkey] = method
            if method[0...'keyup'.length] is 'keyup'
                mkey = method['keyup'.length..]
                rv.keyboard.up[mkey] = method
            if method is 'onKey'
                rv.keyboard['all'] = method
            if method in mouseBinds
                rv.mouse[method[5..]] = method
        rv

    _bind: ->
        #: add signal listeners for device actions
        {bind} = Wage
        {keyboard, mouse} = @control.devices
        listeners = @_getListeners()
        for signal, val of listeners.mouse
            mouse.signals[signal].add bind(this, this[val])
        for stype, vals of listeners.keyboard
            if vals.constructor isnt Array and this[vals]
                keyboard.signals[stype].add bind(this, this[vals])
                continue
            for vkey, val of vals
                keyboard.signals[stype][vkey.toLowerCase()].add bind(this, this[val])
        return

    #addListeners: ->
    #    @domElement.addEventListener(
    #        'contextmenu'
    #        (e) ->
    #            e.preventDefault()
    #            return
    #        false
    #    )
    #    {bind} = Wage
    #    for key in @bindable
    #        if this[key] isnt undefined
    #            @domElement.addEventListener key, bind(this, this[key]), false
    #    return

    update: (dt) ->
        return

env = self.Wage ?= {}
env.Controller = Controller
