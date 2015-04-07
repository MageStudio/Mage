Class("RightSidebar", {
    RightSidebar: function() {
        Sidebar.call(this, "right");
        this.meshViewOrder = ["meshHeader"];
        //setting mesh listener
        this.meshListener = new MeshListener();
        //setting light listener
        this.lightListener = new LightListener();
    },

    setListeners: function() {
        //calling super method
        this._setListeners();

        //Setting mesh listeners 
        this.meshListener.setListeners();
        //Setting light listeners
        this.lightListener.setListeners();

        //setting listener for mesh selected
        app.interface.events.selectedMesh.add(this.onSelectedMesh);
        //setting listener for mesh deselect
        app.interface.events.deselectedAll.add(this.onDeselectedAll);
    },

    onSelectedMesh: function() {
        //no mesh selected message must disappear
        if (!$('#nomeshselected').hasClass('hidden')) $('#nomeshselected').addClass('hidden');
        //unloading previous view
        app.interface.loader.unload();
        //retrieving object
        console.log(app.sm.typeClicked);
        switch(app.sm.typeClicked) {
            case "mesh":
                //we clicked on a mesh
                app.interface.rightSidebar._handleMesh();
                break;
            case "light":
                //we clicked on a light
                app.interface.rightSidebar._handleLight();
                break;
        }
    },

    onDeselectedAll: function() {
        //no mesh selected message must appear
        $('#nomeshselected').removeClass('hidden');
    },

    // handling meshes
    _handleMesh: function() {
        //we must check element type [mesh, light, sound, model]
        //loading corresponding views
        //we should load views depending on mesh properties
        var o = app.mm.map.get(app.sm.uuid);
        var views = ["meshHeader"];
        views.push(o.material.type);
        //loading views
        app.interface.loader.loadArray(views, function() {
            //resetting interface input listeners
            app.interface.setInputEvents("#meshColor");
            //we are now sure views have been inflated
            //this is used only to show values for first time
            //to see what happens when values are changed,
            //see file Interface.Sidebar.MeshListener

            //setting name
            $('#meshName').val(o.name);

            //setting group
            $('#meshGroup').val(o.group);

            //setting position
            $('#position_x').val(o.position.x);
            $('#position_y').val(o.position.y);
            $('#position_z').val(o.position.z);

            //setting rotation
            $('#rotation_x').val(o.rotation.x);
            $('#rotation_y').val(o.rotation.y);
            $('#rotation_z').val(o.rotation.z);

            //setting textures listeners
            //listening for file inputs
            // #TODO should write texture name
            $('#textureMap').unbind().change(app.interface.rightSidebar.meshListener.onTextureLoaded);
            $('#lightMap').unbind().change(app.interface.rightSidebar.meshListener.onLightMapLoaded);
            $('#specularMap').unbind().change(app.interface.rightSidebar.meshListener.onSpecularMapLoaded);
            $('#alphaMap').unbind().change(app.interface.rightSidebar.meshListener.onAlphaMapLoaded);
            $('#envMap').unbind().change(app.interface.rightSidebar.meshListener.onEnvMapLoaded);

            //setting updateMesh click listener
            $('#updateMesh').click(app.interface.rightSidebar.meshListener.updateMeshRotPosName);

            //setting flags
            $('#visibleToggle').attr('checked', o.visible);
            $('#castToggle').attr('checked', o.castShadow);
            $('#wireframeToggle').attr('checked', o.material.wireframe);
            $('#receiveToggle').attr('checked', o.receiveShadow);
            $('#fogToggle').attr('checked', o.fog);

            //setting color
            var colorString = app.util.RgbToHex(parseInt(o.material.color.r), parseInt(o.material.color.g), parseInt(o.material.color.b));
            $('#meshColor').val(colorString);
            $('#meshColor').css('background-color', colorString);

            //Setting textures info if available
            if (o.material.map) {
                $('#textureMap').next().html(
                    o.material.map.sourceFile + 
                    "<img style='height:30px; margin-left: 5px;' src='"+o.material.map.sourceFile+"'></img>"
                );
            }
            if (o.material.lightMap) {
                $('#lightMap').next().html(
                    o.material.lightMap.sourceFile + 
                    "<img style='height:30px; margin-left: 5px;' src='"+o.material.lightMap.sourceFile+"'></img>"
                );
            }
            if (o.material.specularMap) {
                $('#specularMap').next().html(
                    o.material.specularMap.sourceFile + 
                    "<img style='height:30px; margin-left: 5px;' src='"+o.material.specularMap.sourceFile+"'></img>"
                );
            }
            if (o.material.envMap) {
                $('#envMap').next().html(
                    o.material.envMap.sourceFile + 
                    "<img style='height:30px; margin-left: 5px;' src='"+o.material.envMap.sourceFile+"'></img>"
                );
            }
            if (o.material.alphaMap) {
                $('#alphaMap').next().html(
                    o.material.alphaMap.sourceFile + 
                    "<img style='height:30px; margin-left: 5px;' src='"+o.material.alphaMap.sourceFile+"'></img>"
                );
            }
        });
    },

    // handling light
    _handleLight: function(light) {
        //check the type of light
        var l = app.lm.map.get(app.sm.uuid);
        var views = ["lightHeader"];
        views.push(l.light.type);
        //loading views
        app.interface.loader.loadArray(views, function() {
            //resetting interface input listeners
            app.interface.setInputEvents("#lightColor");
            //we are now sure views have been inflated
            //this is used only to show values for first time
            //to see what happens when values are changed,
            //see file Interface.Sidebar.MeshListener

            //setting name
            $('#lightName').val(l.light.name);

            //setting group
            $('#lightGroup').val(l.light.group);

            //setting position from holder
            $('#position_x').val((l.holder) ? l.holder.position.x : l.light.position.x);
            $('#position_y').val((l.holder) ? l.holder.position.y : l.light.position.y);
            $('#position_z').val((l.holder) ? l.holder.position.z : l.light.position.z);

            //setting rotation from holder
            $('#rotation_x').val((l.holder) ? l.holder.rotation.x : l.light.rotation.x);
            $('#rotation_y').val((l.holder) ? l.holder.rotation.x : l.light.rotation.x);
            $('#rotation_z').val((l.holder) ? l.holder.rotation.x : l.light.rotation.x);

            //setting updateLight click listener
            $('#updateLight').click(app.interface.rightSidebar.lightListener.updateLightRotPosName);

            //setting light properties
            $('#intensity').val(l.light.intensity ? l.light.intensity : 1);
            $('#distance').val(l.light.distance ? l.light.distance : 100);
            $('#decay').val(l.light.decay ? l.light.decay : 100);

            //setting shadow properties
            $('#castShadow').attr('checked', l.light.castShadow);
            $('#receiveShadow').attr('checked', l.light.receiveShadow);
            $('#showCamera').attr("checked", l.light.shadowCameraVisible);
        });
    }

})._extends("Sidebar");