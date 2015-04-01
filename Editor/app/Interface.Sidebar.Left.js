Class("LeftSidebar", {
    LeftSidebar: function() {
        Sidebar.call(this, "left");
        //setting availables flags
        this.availableFlags = ["mesh", "light", "sound"];
        //storing last clicked element in hierarchy
        this.lastClicked = "";
    },

    setListeners: function() {
        //calling the super method
        this._setListeners();
        
        //setting listener on fog slider
        $('#fogDensity').change(function() {
            //triggering fog density change event
            app.interface.events.fogDensityChange.dispatch($(this).val());
        });

        //adding listeners for controls button
        $('#controlsTranslate').click(function() {
            app.interface.events.transformModeChange.dispatch("translate");
            $('#controlsMode').text('Control Mode: Translate');
        });
        $('#controlsRotate').click(function() {
            app.interface.events.transformModeChange.dispatch("rotate");
            $('#controlsMode').text('Control Mode: Rotate');
        });
        $('#controlsScale').click(function() {
            app.interface.events.transformModeChange.dispatch("scale");
            $('#controlsMode').text('Control Mode: Scale');
        });
        $('#controlsSpace').unbind().click(function() {
            var currentSpace = __upperCaseFirstLetter__(app.sm.transformControl.space == "local" ? "world" : "local");
            $('#controlsSpaceValue').text('Control Space: '+currentSpace);
            app.interface.events.transformSpaceChange.dispatch();
        });

        //registering for mesh added event
        app.interface.events.meshAdded.add(this.onAdded)
        //registering for light added event
        app.interface.events.lightAdded.add(this.onAdded);
        //registering for sound added event
        app.interface.events.soundAdded.add(this.onAdded);
    },

    //events listeners for mesh, light and sound added
    onAdded: function() {
        //first we clear the list
        $('#sceneHierarchy').html("");
        //counting faces and vertices
        var faces=0,vertices=0;
        //traversing the scene then adding elements;
        app.sm.scene.traverse(function(object) {
            if (app.interface.leftSidebar.availableFlags.indexOf(object.flag) != -1) {
                var c = (app.interface.hierarchy > 0) ? "son" : "parent";
                var f = (c == "parent") ? (object.flag + "_flag") : "";
                if (app.interface.leftSidebar.lastClicked == object.uuid) {
                    f += " selected";
                }
                var margin = app.sm.hierarchy * 20;
                if (object.flag == "mesh") {
                    faces += object.geometry.faces.length;
                    vertices += object.geometry.vertices.length;
                    $('#sceneVertices').text('Vertices: '+vertices);
                    $('#sceneFaces').text('Faces: '+faces);
                }
                $('#sceneHierarchy').append('<li id="'+object.uuid+'" data-flag="'+object.flag+'"data-uuid="'+object.uuid+'" class="'+c+' '+f+'" style="margin-left:'+margin+'px;">'+object.name+'</li>');
            }
        });

        //setting #sceneHierarchy li listeners
        $('#sceneHierarchy li').unbind().click(function() {
            var uuid = $(this).data("uuid");
            var flag = $(this).data("flag");
            //storing uuid of selected
            app.interface.leftSidebar.lastClicked = uuid;
            //removing selected class from al elements
            $('#sceneHierarchy li').removeClass("selected");
            $(this).addClass("selected");
            //check o type
            var o;
            if (flag == "mesh") {
                console.log("mesh");
                //retrieving mesh
                o = app.mm.map.get(uuid);
                //selecting the mesh
                app.sm.select(o, "translate");
            } else if (flag == "light") {
                //retrieving light
                o = app.sm.scene.getObjectByProperty("uuid", uuid);
                //selecting the light
                app.sm.select(o.light);
            } else {
                console.log("bazza");
            }
        });
    }
})._extends("Sidebar");