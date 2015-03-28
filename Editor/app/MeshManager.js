Class("MeshManager", {
    MeshManager: function() {
        //creating hashmap for storing meshes
        //creating list of allowed meshes
        //remember last clicked mesh
        this.map = new HashMap();
        this.meshes = [];
        this.lastClicked = undefined;
        this.allowedMeshes = ["cube", "sphere"];
    },

    store: function(uuid, element) {
        this.map.put(uuid, element);
    },

    addMesh: function(type) {
        /*
            if type is allowed, proceed to call the proper creation method
            then store it inside our map, adding a callback method
            to the stored mesh -> listening to user click;
        */
        if (this.allowedMeshes.indexOf(type) != -1) {
            //we're creating a valid mesh
            var mesh = this["_add"+__upperCaseFirstLetter__(type)]();
            //add new mesh to the scene and to meshes list
            app.sm.scene.add(mesh);
            app.mm.meshes.push(mesh);
            //store new mesh in our map
            app.mm.store(mesh.uuid, mesh);
            //forcing scene to update itself
            app.sm.update();
            //attach new mesh to transform control
            //app.sm.transformControl.attach(mesh);
            //creating a callback for our mesh
            app.interface.meshEvents.bind(mesh, "click", function(event) {
                //now only adding this mesh to the transform control
                if (app.sm.lastClicked) {
                    app.sm.transformControl.detach(app.sm.lastClicked);
                }
                app.sm.transformControl.attach(event.target);
                app.mm.lastClicked = event.target;
            });
        }
    },

    onMouseDown: function(event) {
        /*console.log("click");
        event.preventDefault();

        var raycaster = new THREE.Raycaster();
        var mouse = new THREE.Vector2();

        mouse.x = ( event.clientX / document.body.clientWidth ); //* 2 - 1;
        mouse.y = - ( event.clientY / document.body.clientHeight ); //* 2 + 1;

        console.log(mouse);
        console.log(event);

        raycaster.setFromCamera( mouse, app.sm.camera );
        if (app.mm.meshes.length != 0) {
            var intersects = raycaster.intersectObjects(app.mm.meshes);
            if ( intersects.length > 0 ) {
                intersects[0].object.callback();
            }
        } else {
            console.log("no elements to check");
        }*/
    },

    //Creation methods

    _addCube: function() {
        /*
            create simple cube with simple wireframe
            then return it;
        */
        var geo, mat, cube;

        geo = new THREE.BoxGeometry(100, 100, 100);
        mat = new THREE.MeshBasicMaterial({wireframe: false, color: 0xff0000});
        cube = new THREE.Mesh(geo, mat);

        return cube;
    },
});