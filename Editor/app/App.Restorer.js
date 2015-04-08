Class("Restorer", {
    Restorer: function(data) {
        //check if there's something to restore or not
        this.nothingToRestore = true;
        for (var k in app.storage.keys) {
            if (data[app.storage.currentProject+"_"+k]) {
                this.nothingToRestore = false;
            }
        }
        if (this.nothingToRestore) return;
        this.lights = data[app.storage.currentProject+"_lights"];
        this.meshes = data[app.storage.currentProject+"_meshes"];
        //flags
        this.meshesFlag = (this.meshes.keys.length > 0);
        this.lightsFlag = (this.lights.keys.length > 0); // true/false whether we recovered something or not
        //object loader
        this.loader = new THREE.ObjectLoader();
    },

    restore: function() {
        //if nothing to restore, return
        if (this.nothingToRestore) return;
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
        for (var j=0; j<this.lights.total; j++) {
            var k = this.lights.keys[j];
            var l = this.lights.map[k];
            //recreating light, holder, target, helper
            var o = {
                flag: "light",
                holder: (l.holder) ? this.loader.parse(l.holder) : false,
                //helper: (l.helper) ? this.loader.parse(l.helper) : false,
                target: (l.target) ? this.loader.parse(l.target) : false,
                light: (l.light) ? this.loader.parse(l.light) : false
            };
            //setting o.light.flag
            o.light.flag = "light";
            //setting helpers ecc
            if (l.light.object.type == "DirectionalLight") {
                //i have to add helper
                var size = 50;
                o.helper = new THREE.DirectionalLightHelper(o.light, size);
                o.light.castShadow = true;
                o.light.shadowCameraVisible = true;

                o.light.shadowMapWidth = 512;
                o.light.shadowMapHeight = 512;

                var d = 200;
                o.light.shadowCameraLeft = -d;
                o.light.shadowCameraRight = d;
                o.light.shadowCameraTop = d;
                o.light.shadowCameraBottom = -d;
                // #TODO be able to change shadow camera far
                o.light.shadowCameraFar = 1000;
                o.light.shadowDarkness = 0.2;
            } else if (l.light.object.type == "AmbientLight") {
                //we just need to set helper false
                o.helper = false;
            } else if (l.light.object.typ == "PointLight") {
                var sphereSize = 50;
                o.helper = new THREE.PointLightHelper(o.light, sphereSize);

                //every light must cast shadow
                o.light.castShadow = true;
                var d = 200;
                o.light.shadowCameraLeft = -d;
                o.light.shadowCameraRight = d;
                o.light.shadowCameraTop = d;
                o.light.shadowCameraBottom = -d;
                // #TODO be able to change shadow camera far
                o.light.shadowCameraFar = 1000;
                o.light.shadowDarkness = 0.2;
            }
            //we're now ready to add our lights to the scene
            //add light to scene
            app.sm.scene.add(o.light)
            //pushing light into array
            app.lm.lights.push(o.light);
            //storing this light
            app.lm.store(o.light.uuid, o);
            //forcing scene update
            app.sm.update();
            //setting
            app.sm.uuid = o.light.uuid;
            app.sm.typeClicked = "light";
            //adding to transform
            if (o.holder) {
                app.sm.select(o.holder, "translate");
            } else {
                app.sm.select(o.light, "translate");
            }
            //check if this light has helper
            if (o.helper) {
                //adding helper to scene
                app.sm.scene.add(o.helper);
                //ading helper to mesh lists
                app.mm.meshes.push(o.helper);
                //adding click listener to helper
                app.interface.meshEvents.bind(o.helper, "click", function(event) {
                    //now only adding this mesh to the transform control
                    if (app.sm.lastClicked.uuid === event.target.light.uuid) return;
                    app.sm.deselect();
                    //Setting uuid to the scene
                    app.sm.uuid = event.target.light.uuid;
                    app.sm.typeClicked = "light";
                    app.sm.select(event.target.light, "translate");
                });
                //calling addedmesh event
                app.interface.events.meshAdded.dispatch();
            }
            //check if this has target
            if (o.target) {
                //Setting target name
                o.target.name = "Target_"+this.lightCount;
                o.target.flag = "target";
                //add target to the scene
                app.sm.scene.add(o.target);
                //adding target to meshes list
                // #TODO remove this when exporting
                app.mm.meshes.push(o.target);
                //adding click listener to target
                app.interface.meshEvents.bind(o.target, "click", function(event) {
                    if (app.sm.lastClicked.uuid === event.target.uuid) return;
                    app.sm.deselect();
                    app.sm.select(event.target, "translate");
                });
                //calling addedmesh event
                app.interface.events.meshAdded.dispatch();
            }
            //check if we need to use holder
            if (o.holder) {
                //Setting holder name
                o.holder.name = "Holder_"+this.lightCount;
                o.holder.flag = "holder";
                //adding holder to the scene
                app.sm.scene.add(o.holder);
                //adding holder to meshesh list -- do we really need to do this?
                // #TODO remove this when exporting
                app.mm.meshes.push(o.holder);
                //adding click listener to holder
                app.interface.meshEvents.bind(o.holder, "click", function(event) {
                    if (app.sm.lastClicked.uuid === event.target.uuid) return;
                    app.sm.deselect();
                    app.sm.uuid = o.light.uuid;
                    app.sm.typeClicked = "light";
                    app.sm.select(event.target, "translate");
                });
                //calling addedmesh event
                app.interface.events.meshAdded.dispatch();
            }
            //increasing light count
            this.lightCount++;
            //triggering light added event
            app.interface.events.lightAdded.dispatch();
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