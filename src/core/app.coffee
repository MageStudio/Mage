class App
    constructor: ->
        @log_types =
            e: "error"
            w: "warn"
            i: "info"

        @util =
            h: window.innerHeight
            w: window.innerWidth
            ratio: (window.innerWidth/window.innerHeight)
            frameRate: 60
            camera:
                fov: 75
                near: 0.1
                far: 100

        @threeLib = undefined

        # scene parameters
        @camera = undefined;
        @user = undefined;
        @scene = undefined;
        @renderer= undefined;

        # debug mode
        @debug = true

        @clock = new THREE.Clock()

        # window and mouse variables
        @mouseX = 0;
        @mouseY = 0;
        @zoom = 0;

        @windowHalfX = window.innerWidth / 2;
        @windowHalfY = window.innerHeight / 2;
        @CAMERA_MAX_Z = 1000;
        @CAMERA_MIN_Z = 250;

        {@leap} = Wage

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
        return

    add: (mesh, element) ->
        @scene.add mesh
        @world.entities[mesh.uuid] = element
        return

    remove: (mesh) ->
        @scene.remove(mesh)
        delete @world.entities[mesh.uuid]
        return

    init: ->
        @three = THREE
        return

    load: ->
        return

    log: ->
        return

    keyup: (e) ->
        return

    keydown: (e) ->
        return

env = self.Wage ?= {}
env.App = App
