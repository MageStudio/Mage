Class("SidebarLoader", {
    SidebarLoader: function() {
        //this must call ajax to load views
        this.container = $('#rightContainer');
        //storing file names
        this.baseUrl = "views/";
        this.views = {
            "meshHeader": "meshheader.html"
        };
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

    unload: function() {
        this.container.html("");
    },

    //on select and deselect event listeners
    onDeselectedAll: function() {
        app.interface.loader.unload();
    }
});