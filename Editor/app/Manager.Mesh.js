Class("MeshManager", {
    MeshManager: function() {
        //creating hashmap for storing meshes
        //creating list of allowed meshes
        //remember last clicked mesh
        this.map = new HashMap();
        this.meshes = [];
        this.allowedMeshes = [
            "cube",
            "sphere",
            "cylinder",
            "plane",
            "dodecahedron",
            "tube",
            "thorus"
        ];
        this.allowedMaterials = [
            "MeshBasicMaterial",
            "MeshPhongMaterial",
            "MeshDepthMaterial",
            "MeshLambertMaterial",
            "MeshNormalMaterial"
        ];
        this.meshCount = 0;
    },

    store: function(uuid, element) {
        this.map.put(uuid, element);
    },

    update: function() {
        // update method
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
            //every mesh must have castshadow and receive shadow enabled
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            //changing mesh name
            mesh.name = "Mesh_"+this.meshCount;
            mesh.group = "World";
            mesh.flag = "mesh";
            //store new mesh in our map
            app.mm.store(mesh.uuid, mesh);
            //add new mesh to the scene and to meshes list
            app.sm.scene.add(app.mm.map.get(mesh.uuid));
            app.mm.meshes.push(app.mm.map.get(mesh.uuid));
            //forcing scene to update itself
            app.sm.update();
            //attach new mesh to transform control
            //app.sm.transformControl.attach(mesh);
            //creating a callback for our mesh
            app.interface.meshEvents.bind(app.mm.map.get(mesh.uuid), "click", function(event) {
                //now only adding this mesh to the transform control
                if (app.sm.lastClicked.uuid == event.target.uuid) return;
                app.sm.deselect();
                //Setting uuid to the scene
                app.sm.uuid = event.target.uuid;
                app.sm.typeClicked = "mesh";
                app.sm.select(event.target, "translate");
            });
            //increasing meshcount
            this.meshCount++;
            //calling addedmesh event
            app.interface.events.meshAdded.dispatch();
        }
    },

    //Creation methods

    _addCube: function() {
        var geo, mat, cube;

        geo = new THREE.BoxGeometry(100, 100, 100);
        mat = new THREE.MeshBasicMaterial({wireframe: true, color: Math.random() * 0xffffff});
        cube = new THREE.Mesh(geo, mat);

        return cube;
    },

    _addSphere: function() {
        var geo, mat, sphere;

        geo = new THREE.SphereGeometry(50, 32, 32);
        mat = new THREE.MeshBasicMaterial({wireframe: true, color: Math.random() * 0xffffff});
        sphere = new THREE.Mesh(geo, mat);

        return sphere;
    },

    _addCylinder: function() {
        var geo, mat, cyl;
        
        geo = new THREE.CylinderGeometry( 50, 50, 20, 32 );
        mat = new THREE.MeshBasicMaterial({wireframe: true, color: Math.random() * 0xffffff});
        cyl = new THREE.Mesh(geo, mat);

        return cyl;
    },

    _addPlane: function() {
        var geo, mat, plane;

        geo = new THREE.PlaneGeometry(50, 20, 32);
        mat = new THREE.MeshBasicMaterial({wireframe: true, color: Math.random() * 0xffffff});
        plane = new THREE.Mesh(geo, mat);

        return plane;
    },

    _addDodecahedron: function() {
        var geo, mat, dode;

        geo = new THREE.DodecahedronGeometry(50);
        mat = new THREE.MeshBasicMaterial({wireframe: true, color: Math.random() * 0xffffff});
        dode = new THREE.Mesh(geo, mat);

        return dode;
    },

    _addTube: function() {
        var geo, mat, tube;

        var CustomSinCurve = THREE.Curve.create(
            function ( scale ) { //custom curve constructor
                this.scale = (scale === undefined) ? 1 : scale;
            },
            
            function ( t ) { //getPoint: t is between 0-1
                var tx = t * 3 - 1.5,
                    ty = Math.sin( 2 * Math.PI * t ),
                    tz = 0;
                
                return new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale);
            }
        );

        var path = new CustomSinCurve( 10 );

        geo = new THREE.TubeGeometry(path, 20, 20, 80, false);
        mat = new THREE.MeshBasicMaterial({wireframe: true, color: Math.random() * 0xffffff});
        tube = new THREE.Mesh(geo, mat);

        return tube;
    },

    _addThorus: function() {
        var geo, mat, tho;

        geo = new THREE.TorusGeometry(100, 30, 16, 100);
        mat = new THREE.MeshBasicMaterial({wireframe: true, color: Math.random() * 0xffffff});
        tho = new THREE.Mesh(geo, mat);

        return tho;
    },
});