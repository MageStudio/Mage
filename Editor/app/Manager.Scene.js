Class("SceneManager", {
    SceneManager: function() {
        this.camera = undefined;
        this.renderer = undefined;
        this.scene = undefined;
        this.controls = undefined;
        this.container = document.getElementById( 'scenecontainer' );
        //holding clicked mesh
        this.lastClicked = {uuid: ""};
        this.availableTransformModes = ["translate", "rotate", "scale"];
    },

    update: function() {
        app.sm.controls.update();
        app.sm.transformControl.update();

        //updating mesh manager
        app.mm.update();

        //rendering scene
        app.sm.render();

        //requesting new animation frame
        setTimeout(function() {
            requestAnimFrame(app.sm.update);
        }, 1000/60);
        //requestAnimFrame(app.sm.update);
    },

    init: function() {

        this.camera = new THREE.PerspectiveCamera( 70, $(this.container).width() / $(this.container).height(), 1, 5000 );
        this.camera.position.set( 1000, 500, 1000 );
        this.camera.lookAt( new THREE.Vector3( 0, 200, 0 ) );


        this.controls = new THREE.OrbitControls( this.camera );
        this.controls.damping = 0.2;
        //setting max distance
        this.controls.maxDistance = 4000;
        this.controls.addEventListener( 'change', app.sm.render );

        // creating scene
        this.scene = new THREE.Scene();

        // attaching grid to the scene
        this.grid = new THREE.GridHelper(1000,100);
        this.scene.add( this.grid );
       
        // creating renderer
        this.renderer = new THREE.WebGLRenderer( { antialias: false } );
        //this.renderer.setClearColor( this.scene.fog.color );
        this.renderer.sortObjects = false;
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( $(this.container).width(), $(this.container).height() );

        this.container.appendChild( this.renderer.domElement );

        // creating stats helper
        this.stats = new Stats();
        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.top = '0px';
        this.stats.domElement.style.zIndex = 100;
        this.container.appendChild( this.stats.domElement );

        // creating transform control
        this.transformControl = new THREE.TransformControls( this.camera, this.renderer.domElement );
        this.transformControl.addEventListener( 'change', app.sm.render );
        this.scene.add(this.transformControl);

        // calling update and render methods
        this.update();
        this.render();
    },

    render: function() {
        app.sm.renderer.render( app.sm.scene, app.sm.camera );
        app.sm.stats.update();
    },

    onWindowResize: function() {
        app.sm.camera.aspect = $(app.sm.container).width() / $(app.sm.container).height();
        app.sm.camera.updateProjectionMatrix();

        app.sm.renderer.setSize( $(app.sm.container).width(), $(app.sm.container).height() );

        app.sm.render();
    },

    handleInput: function(code) {
        if (app.interface.isModalShowing) return;
        switch ( code ) {
            case 81: // Q
                app.sm.transformControl.setSpace( app.sm.transformControl.space == "local" ? "world" : "local" );
                break;
            case 87: // W
                app.sm.transformControl.setMode( "translate" );
                break;
            case 69: // E
                app.sm.transformControl.setMode( "rotate" );
                break;
            case 82: // R
                app.sm.transformControl.setMode( "scale" );
                break;
            case 187:
            case 107: // +,=,num+
                app.sm.transformControl.setSize( app.sm.transformControl.size + 0.1 );
                break;
            case 189:
            case 10: // -,_,num-
                app.sm.transformControl.setSize( Math.max(app.sm.transformControl.size - 0.1, 0.1 ) );
                break;
            case 68:
                //deselect
                app.sm.deselect();
                break;
        }
    },

    select: function(mesh, mode) {
        if (this.availableTransformModes.indexOf(mode) == -1) return;
        this.transformControl.setMode(mode);
        this.transformControl.attach(mesh);
        //setting lastclicked in meshmanager
        this.lastclicked = mesh;
    },

    deselect: function(mesh) {
        if (mesh) {
            this.transformControl.detach(mesh);
            return;
        }
        this.transformControl.detach();
    }
});