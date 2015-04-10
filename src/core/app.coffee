class App
    constructor: (@options={}) ->
        @debug = true or @options.debug

        @log_types =
            e: "error"
            w: "warn"
            i: "info"

        @_config =
            physics: false
            camera:
                fov: 75
                near: 0.1
                far: 100
            frameRate: 60
            alphaRender: false
            castShadows: true
            handlers:
                mouse: Wage.Mouse
                leap: Wage.Leap

        @config = {}

        @_physiscs = false

        @devices = {}

        @util =
            h: window.innerHeight
            w: window.innerWidth
            ratio: (window.innerWidth/window.innerHeight)
            frameRate: 60
            camera:
                fov: 75
                near: 0.1
                far: 100

        # scene parameters
        @camera = undefined;
        @user = undefined;
        @scene = undefined;
        @renderer= undefined;

        # window and mouse variables
        @mouseX = 0;
        @mouseY = 0;
        @zoom = 0;

        @windowHalfX = window.innerWidth / 2;
        @windowHalfY = window.innerHeight / 2;
        @CAMERA_MAX_Z = 1000;
        @CAMERA_MIN_Z = 250;

        @assets =
            sounds: {}
            images: {}
            shaders: {}
            videos: {}

    onCreate: ->
        return

    preload: (callback) ->
        callback()
        return

    prepareScene: ->
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

    customRender: ->
        return

    render: ->
        scope = this
        {scene} = Wage

        setTimeout( ->
            if scope._physiscs
                scene.simulate()
            requestAnimationFrame(scope.render)
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
        scene.remove(mesh)
        delete world.entities[mesh.uuid]
        return

    _loadConfig: ->
        for key, val of @_config
            if @options[key] isnt undefined
                val = @options[key]
            @config[key] = val
        # max fps to 120
        if @config.frameRate > 120
            @config.frameRate = 120
        # init devices handlers
        for key, val of @config.devices
            @devices[key] = new val()
        return

    init: ->
        {screen, world} = Wage
        @_loadConfig()
        if @config.physics
            try
                Physijs.scripts.worker = 'workers/physijs_worker.js'
                Wage.scene = new Physijs.Scene()
                @_physiscs = true
            catch e
                @log(e)
        if not @_physiscs
            Wage.scene = new THREE.Scene()
        Wage.camera = new Wage.Camera(@config.camera).object
        renderer = Wage.renderer = new THREE.WebGLRenderer
            alpha: @config.alphaRender
        if @config.castShadows
            renderer.shadowMapEnabled = true
            renderer.shadowMapType = THREE.PCFSoftShadowMap
        renderer.setSize(screen.w, screen.h)
        document.getElementById('gameContainer').appendChild renderer.domElement
        # TODO user control
        #      game
        world.update()
        # TODO control
        @onCreate()
        @render()
        return

    load: ->
        return

    _prepare: ->
        @prepareScene()
        @load()
        return

    start: ->
        {assets} = Wage.managers
        assets.load @_prepare
        return

    log: ->
        if not @debug
            return

    keyup: (e) ->
        return

    keydown: (e) ->
        return

env = self.Wage ?= {}
env.App = App
