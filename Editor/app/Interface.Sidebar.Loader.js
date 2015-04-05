Class("SidebarLoader", {
    SidebarLoader: function() {
        //this must call ajax to load views
        this.container = $('#rightContainer');
        //storing file names
        this.baseUrl = "views/";
        this.views = {
            "meshHeader": "meshheader.html",
            "MeshBasicMaterial": "MeshBasicMaterial.html",
            "MeshPhongMaterial": "MeshPhongMaterial.html",
            "MeshLambertMaterial": "MeshLambertMaterial.html",
            "MeshDepthMaterial": "MeshDepthMaterial.html",
            "MeshNormalMaterial": "MeshNormalMaterial.html",
            //lights
            "lightHeader": "lightHeader.html",
            "AmbientLight": "AmbientLight.html",
            "DirectionalLight": "DirectionalLight.html",
            "PointLight": "PointLight.html"
        };
        this.holder = [];
    },

    setListeners: function() {
        //setting listeners for deselected all
        app.interface.events.deselectedAll.add(this.onDeselectedAll);
    },

    load: function(view) {
        if (view in this.views) {
            var url = this.baseUrl + "" + this.views[view];
            $.ajax(url).done(function(data) {
                app.interface.loader.container.append(data);
            });
        }
    },

    loadArray: function(views, callback) {
        var view  = views[0];
        if (!view) {
            //the end of views array
            callback();
        } else {
            if (view in this.views) {
                var url = this.baseUrl + "" + this.views[view];
                $.ajax(url).done(function(data) {
                    app.interface.loader.container.append(data);
                    views.reverse().pop();
                    app.interface.loader.loadArray(views.reverse(), callback);
                });
            }
        }
    },

    unload: function() {
        this.container.html("");
    },

    //on select and deselect event listeners
    onDeselectedAll: function() {
        app.interface.loader.unload();
    }
});