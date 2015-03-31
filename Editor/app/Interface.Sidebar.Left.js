Class("LeftSidebar", {
    LeftSidebar: function() {
        Sidebar.call(this, "left");
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
        app.interface.events.meshAdded.add(this.onMeshAdded)
        //registering for light added event
        app.interface.events.lightAdded.add(this.onLightAdded);
        //registering for sound added event
        app.interface.events.soundAdded.add(this.onSoundAdded);
    },

    //events listeners for mesh, light and sound added
    onMeshAdded: function() {
        //first we clear the list
        $('#sceneHierarchy').html("");
        //traversing the scene then adding elements;
        app.sm.scene.traverse(function(object) {
            if (object.flag == "mesh") {
                var c = (app.interface.hierarchy > 0) ? "son" : "parent";
                var margin = app.interface.hierarchy * 20;
                $('#sceneHierarchy').append('<li data-uuid="'+object.uuid+'" class="'+c+'" style="margin-left:'+margin+'px;">'+object.name+'</li>')
            }
        });
    },

    onLightAdded: function() {

    },

    onSoundAdded: function() {

    }
})._extends("Sidebar");