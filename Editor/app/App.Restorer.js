Class("Restorer", {
    Restorer: function(data) {
        this.lights = data[app.storage.currentProject+"_lights"];
        this.meshes = data[app.storage.currentProject+"_meshes"];
        //flags
        this.meshesFlag = (this.meshes.keys.length > 0);
        this.lightsFlag = (this.lights.keys.length > 0); // true/false whether we recovered something or not
        //object loader
        this.loader = new THREE.ObjectLoader();
    },

    restore: function() {
        //restoring meshes
        for (var i=0; i<this.meshes.total; i++) {
            var k = this.meshes.keys[i];
            //recreating mesh
            var mesh = this.loader.parse(this.meshes.map[k]);
            //every mesh must have castshadow and receive shadow enabled
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            //setting correct flag
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
            app.mm.meshCount++;
            //calling addedmesh event
            app.interface.events.meshAdded.dispatch();
        }
        //restoring lights
        for (var j=0; j<this.lights.keys.length; j++) {

        }
        //restoring models
        //restoring sounds
        //updating all materials
        if (this.meshesFlag) {
            var keys_list = app.mm.map.keys.concat();
            if (keys_list.length != 0) {
                var start = +new Date();
                do {
                    app.mm.map.get(keys_list.shift()).material.needsUpdate = true;
                } while (keys_list.length > 0 && (+new Date() - start < 50));
            }
        }
    }
})