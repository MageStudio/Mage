Class("SceneManager", {
    SceneManager: function() {
        this.camera = undefined;
        this.renderer = undefined;
        this.scene = undefined;
        this.controls = undefined;
    },

    animate: function() {
        requestAnimFrame(app.sm.animate);
        app.sm.controls.update();
        app.sm.transformControl.update();
    },

    init: function() {

        this.container = document.getElementById( 'scenecontainer' );

        this.camera = new THREE.PerspectiveCamera( 60, $(this.container).width() / $(this.container).height(), 1, 1000 );
        this.camera.position.z = 500;

        this.controls = new THREE.OrbitControls( this.camera );
        this.controls.damping = 0.2;
        this.controls.addEventListener( 'change', app.sm.render );


        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );

        // world

        var geometry = new THREE.CylinderGeometry( 0, 10, 30, 4, 1 );
        var material =  new THREE.MeshLambertMaterial( { color:0xffffff, shading: THREE.FlatShading } );

        for ( var i = 0; i < 500; i ++ ) {

            var mesh = new THREE.Mesh( geometry, material );
            mesh.position.x = ( Math.random() - 0.5 ) * 1000;
            mesh.position.y = ( Math.random() - 0.5 ) * 1000;
            mesh.position.z = ( Math.random() - 0.5 ) * 1000;
            mesh.updateMatrix();
            mesh.matrixAutoUpdate = false;
            this.scene.add( mesh );

        }


        // lights

        light = new THREE.DirectionalLight( 0xffffff );
        light.position.set( 1, 1, 1 );
        this.scene.add( light );

        light = new THREE.DirectionalLight( 0x002288 );
        light.position.set( -1, -1, -1 );
        this.scene.add( light );

        light = new THREE.AmbientLight( 0x222222 );
        this.scene.add( light );


        // renderer

        this.renderer = new THREE.WebGLRenderer( { antialias: false } );
        this.renderer.setClearColor( this.scene.fog.color );
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( $(this.container).width(), this.container.innerHeight );

        this.container.appendChild( this.renderer.domElement );

        this.stats = new Stats();
        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.top = '0px';
        this.stats.domElement.style.zIndex = 100;
        this.container.appendChild( this.stats.domElement );

        this.transformControl = new THREE.TransformControls( this.camera, this.renderer.domElement );
        this.transformControl.addEventListener( 'change', this.render );
        this.scene.add(this.transformControl);

        this.animate();
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
        }
    }
});