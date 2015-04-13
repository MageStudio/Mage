class App
    constructor: (@options={}) ->
        @debug = true or @options.debug
        #: some log utils
        @log_types =
            e: "error"
            w: "warn"
            i: "info"
        #: default configuration
        @_config =
            physics: false
            camera:
                fov: 75
                near: 0.1
                far: 100
            frameRate: 60
            alphaRender: false
            castShadows: true
            controller: Wage.FreeController
            handlers:
                mouse: Wage.Mouse
                leap: Wage.Leap
        #: configuration object (filled in with default and user options)
        @config = {}
        #: handle physics only if requested
        @_physiscs = false
        #: to store input devices handlers
        @devices = {}
        #: to store game assets
        @assets =
            sounds: {}
            images: {}
            shaders: {}
            videos: {}
        return this

    onCreate: ->
        return

    preload: (callback) ->
        callback()
        return

    onPrepare: ->
        return

    progressAnimation: (callback) ->
        $('#loader').animate(
            opacity: 0
            'margin-top': "250px"
        1000
        ->
            $('#loader').remove()
            $('body').animate(
                backgroundColor: '#fff'
            200
            callback
            )
            return
        )
        return

    render: ->
        return

    _render: ->
        scope = this
        {scene, camera, world, control, renderer} = Wage
        {audio, lights} = Wage.managers
        #: call updates
        audio.update()
        lights.update()
        # [note] camera entity is updated by world
        world.update()
        control.update()
        #: update scene
        renderer.clear()
        @render()
        renderer.render scene, camera
        #: set next call
        setTimeout( ->
            if scope._physiscs
                scene.simulate()
            requestAnimationFrame(scope._render)
            return
        1000 / @config.frameRate)
        return

    add: (mesh, element) ->
        {scene, world} = Wage
        scene.add mesh
        world.entities[mesh.uuid] = element
        return

    remove: (mesh) ->
        {scene, world} = Wage
        scene.remove mesh
        delete world.entities[mesh.uuid]
        return

    _loadConfig: ->
        for key, val of @_config
            if @options[key] isnt undefined
                val = @options[key]
            @config[key] = val
        # max fps to 120!
        if @config.frameRate > 120
            @config.frameRate = 120
        #: init devices handlers
        for key, val of @config.devices
            @devices[key] = new val()
        return

    init: ->
        {screen, world} = Wage
        #: load configuration
        @_loadConfig()
        #: init physics (if requested) and scene
        if @config.physics
            try
                Physijs.scripts.worker = 'workers/physijs_worker.js'
                Wage.scene = new Physijs.Scene()
                @_physiscs = true
            catch e
                @log(e)
        if not @_physiscs
            Wage.scene = new THREE.Scene()
        #: init camera
        Wage.camera = new Wage.Camera(@config.camera).object
        #: init renderer
        renderer = Wage.renderer = new THREE.WebGLRenderer
            alpha: @config.alphaRender
        if @config.castShadows
            renderer.shadowMapEnabled = true
            renderer.shadowMapType = THREE.PCFSoftShadowMap
        renderer.autoClear = false
        renderer.setSize screen.w, screen.h
        document.getElementById('gameContainer').appendChild renderer.domElement
        # TODO game
        #: init controls manager
        Wage.control = new Wage.Control()
        #: finish init and render
        @onCreate()
        @_render()
        return

    load: ->
        @progressAnimation @init
        return

    _prepare: ->
        @onPrepare()
        @load()
        return

    start: ->
        {assets} = Wage.managers
        assets.load @_prepare
        return

    log: ->
        if not @debug
            return
        if arguments.length > 1
            if arguments[0] in @log_types
                console[@log_types[arguments[0]]] arguments[1]
                return
        console.log arguments[0]
        return

    keyup: (e) ->
        return

    keydown: (e) ->
        return

env = self.Wage ?= {}
env.App = App
