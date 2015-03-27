Class("MeshManager", {
    MeshManager: function() {
        //creating hashmap for storing meshes
        //creating list of allowed meshes
        //remember last clicked mesh
        this.map = new HashMap();
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
            //attach new mesh to transform control
            app.sm.transformControl.attach(mesh);
            //creating a callback for our mesh
            mesh.callback = function() {
                //now only adding this mesh to the transform control
                if (app.sm.lastClicked) {
                    app.sm.transformControl.detach(app.sm.lastClicked);
                }
                app.sm.transformControl.attach(this);
                app.mm.lastClicked = this;
            }
            //add new mesh to the scene
            app.sm.scene.add(mesh);
            //store new mesh in our map
            this.store(mesh.uuid, mesh);
        }
    },

    //Creation methods

    _addCube: function() {
        /*
            create simple cube with simple wireframe
            then return it;
        */
        var geo, mat, cube;

        geo = new THREE.BoxGeometry(100, 100, 100);
        mat = new THREE.MeshBasicMaterial({wireframe: true, color: 0xff0000});
        cube = new THREE.Mesh(geo, mat);
        cube.position.set(0,0,0);

        return cube;
    },
});