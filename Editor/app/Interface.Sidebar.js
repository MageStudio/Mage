Class("Sidebar", {
    Sidebar: function(type) {
        this.type = type;
    },

    setListeners: function() {
        //attaching left and right column toggle
        app.interface.events.columnToggle.add(this.toggle);
    },

    toggle: function(code) {
        var change = app.interface.sidebarHelper.columnChanger[app.interface.sidebarHelper.currentColumns][code][0];
        var toHide = app.interface.sidebarHelper.columnChanger[app.interface.sidebarHelper.currentColumns][code][1];
        app.interface.sidebarHelper.currentColumns = change;
        var widths = app.interface.sidebarHelper.columnsHelper[app.interface.sidebarHelper.currentColumns];
        //removing hidden class
        $("#left-column").removeClass("hidden");
        $("#center").removeClass("hidden");
        $("#right-column").removeClass("hidden");
        //updating columns width
        $("#left-column").animate({"width": widths[0]}, 200);
        $('#center').css({'width': widths[1]});
        $('#right-column').animate({'width': widths[2]}, 200);
        //adding proper hidden class
        if (toHide == "") return;
        if (toHide == "both") {
            $('#left-column').addClass("hidden");
            $('#right-column').addClass("hidden");
        } else {
            $('#'+toHide).addClass("hidden");
        }
    }
});