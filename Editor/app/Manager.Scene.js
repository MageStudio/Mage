Class("SceneManager", {
    SceneManager: function() {
        this.camera = undefined;
        this.renderer = undefined;
        this.scene = undefined;
        this.controls = undefined;
        this.container = document.getElementById( 'scenecontainer' );
        //holding clicked mesh
        this.lastClicked = {uuid: ""};
        this.uuid = "";
        this.typeClicked = "";
        this.availableTransformModes = ["translate", "rotate", "scale"];
        this.currentTransformSpace = "local";
        //holder for hierarchy.
        this.hierarchy = 0;
        //allowes shadow types
        this.allowedShadowTypes = ["BasicShadowMap", "PCFShadowMap", "PCFSoftShadowMap"];
        //storing animation id
        this.animId = undefined;
    },

    update: function() {
        try {
            app.sm.controls.update();
            app.sm.transformControl.update();

            //updating mesh manager
            app.mm.update();
            //updating light manager
            app.lm.update();
            
            //rendering scene
            app.sm.render();

            //requesting new animation frame
            setTimeout(function() {
                app.sm.animId = requestAnimationFrame(app.sm.update);
            }, 1000/60);
            //requestAnimFrame(app.sm.update);
        } catch(exception) {}
    },

    render: function() {
        app.sm.renderer.render( app.sm.scene, app.sm.camera );
        app.sm.stats.update();
    },

    init: function() {
        this.camera = new THREE.PerspectiveCamera( 70, $(this.container).width() / $(this.container).height(), 1, 5000 );
        this.camera.position.set( 1000, 500, 1000 );
        this.camera.lookAt( new THREE.Vector3( 0, 200, 0 ) );

        // creating scene
        this.scene = new THREE.Scene();

        //rewriting scene.traverse method
        this.scene.traverse = function ( callback ) {
            callback( this );
            if (this.children.length > 0 ) app.sm.hierarchy++;

            for ( var i = 0, l = this.children.length; i < l; i ++ ) {
                this.children[ i ].traverse( callback );
            }
            if (app.sm.hierarchy > 0) app.sm.hierarchy--;
        }

        // attaching grid to the scene
        this.grid = new THREE.GridHelper(1000,100);
        this.scene.add( this.grid );
       
        // creating renderer
        this.renderer = new THREE.WebGLRenderer( { antialias: true } );
        //this.renderer.setClearColor( this.scene.fog.color );
        this.renderer.sortObjects = false;
        this.renderer.setClearColor(new THREE.Color('#000000'));
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize($(this.container).width(), $(this.container).height());
        //enabling shadows
        this.renderer.shadowMapEnabled = true;
        this.renderer.shadowMapSoft = true;
        this.renderer.shadowMapType = THREE.PCFSoftShadowMap;

        this.container.appendChild( this.renderer.domElement );

        // creating stats helper
        this.stats = new Stats();
        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.top = '0px';
        this.stats.domElement.style.zIndex = 100;
        this.container.appendChild( this.stats.domElement );

        //creating orbit controls
        this.controls = new THREE.OrbitControls( this.camera );
        this.controls.damping = 0.2;
        //setting max distance
        this.controls.maxDistance = 4000;
        this.controls.addEventListener( 'change', app.sm.render );

        // creating transform control
        this.transformControl = new THREE.TransformControls( this.camera, this.renderer.domElement );
        this.transformControl.addEventListener( 'change', app.sm.onTransformChange );
        this.scene.add(this.transformControl);

        // calling update and render methods
        this.update();
        this.render();
    },

    setListeners: function() {
        //setting listener for column toggle event
        app.interface.events.columnToggle.add(this.onWindowResize);
        //adding transform events
        app.interface.events.transformSpaceChange.add(this.onTransformSpaceChange);
        app.interface.events.transformModeChange.add(this.onTransformModeChange);
        app.interface.events.transformSizeChange.add(this.onTransformSizeChange);

        //adding fog toggle listener
        app.interface.events.fogChange.add(this.onFogChange);
        //adding fog color change listener
        app.interface.events.fogColorChange.add(this.onFogColorChanged);
        //adding fog density change listener
        app.interface.events.fogDensityChange.add(this.onFogDensityChanged);
        //registering for shadow enabled 
        app.interface.events.shadowChange.add(this.onShadowChange);
    },

    onWindowResize: function() {
        app.sm.camera.aspect = $(app.sm.container).width() / $(app.sm.container).height();
        app.sm.camera.updateProjectionMatrix();

        app.sm.renderer.setSize( $(app.sm.container).width(), $(app.sm.container).height() );

        app.sm.render();
    },

    //on transform change listener
    onTransformChange: function() {
        //triggering events for mesh position/rotation update
        app.interface.events.positionChange.dispatch();
        app.interface.events.rotationChange.dispatch();
        //calling scene render
        app.sm.render();
    },

    // transform controls events
    onTransformSpaceChange: function(space) {
        app.sm.transformControl.setSpace( app.sm.transformControl.space == "local" ? "world" : "local" );
    },

    onTransformModeChange: function(mode) {
        app.sm.transformControl.setMode(mode);
    },

    onTransformSizeChange: function(increase) {
        if (increase) {
            app.sm.transformControl.setSize( app.sm.transformControl.size + 0.1 );
        } else {
            app.sm.transformControl.setSize( Math.max(app.sm.transformControl.size - 0.1, 0.1 ) );
        }
    },

    //fog toggle
    onFogChange: function(flag) {
        if (flag) {
            app.sm.scene.fog = new THREE.FogExp2("#ffffff", 0.5);
            app.sm.render();
        } else {
            app.sm.scene.fog = null;
        }
    },

    //fog color changed event
    onFogColorChanged: function(color) {
        if (app.sm.scene.fog) {
            app.sm.scene.fog.color = new THREE.Color(color);
        }
        //app.sm.scene.fog = new THREE.FogExp2(color, 1);//0.001);
        app.sm.render();
    },

    onFogDensityChanged: function(value) {
        if (app.sm.scene.fog) {
            app.sm.scene.fog.density = value;
        }
        app.sm.render();
    },

    //on shadow change event
    onShadowChange: function(flag) {
        app.sm.renderer.shadowMapEnabled = flag;
        if (flag) {
            app.sm.renderer.shadowMapType = THREE.PCFShadowMap;
        }
    },

    //changing shadow type for renderer
    changeShadow: function(type) {
        if (app.sm.allowedShadowTypes.indexOf(type) == -1) return;
        app.sm.renderer.shadowMapType = THREE[type];
        app.interface.events.shadowTypeChanged.dispatch(type);
    },

    //update all meshes for shadows
    updateShadows: function() {
        //updating meshes
        var keys_list = app.mm.map.keys.concat();
        if (keys_list.length != 0) {
            var start = +new Date();
            do {
                app.mm.map.get(keys_list.shift()).material.needsUpdate = true;
            } while (keys_list.length > 0 && (+new Date() - start < 50));
        }
    },

    //selecting and deselecting meshes
    select: function(mesh, mode) {
        if (this.availableTransformModes.indexOf(mode) == -1) return;
        this.transformControl.setMode(mode);
        this.transformControl.attach(mesh);
        //setting lastclicked in meshmanager
        this.lastClicked = mesh;

        //triggering select mesh event only if not holder or target, but light or mesh
        // #TODO remember to add "model" to typeclicked
        //if ((app.sm.typeClicked == "mesh") || (app.sm.typeClicked == "light")) {
            app.interface.events.selectedMesh.dispatch();
        //}
    },

    deselect: function(mesh) {
        if (mesh) {
            this.transformControl.detach(mesh);
            return;
        }
        this.transformControl.detach();
        //removing old reference
        app.sm.lastClicked = "";
        app.sm.typeClicked = "";

        //triggering on deselect all event
        app.interface.events.deselectedAll.dispatch();
    },

    //remove object from the scene
    // #TODO add remove method
    remove: function(uuid) {

    }
});