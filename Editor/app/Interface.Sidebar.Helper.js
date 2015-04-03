Class("HelperSidebar", {
    HelperSidebar: function() {
        this.columnsHelper = {
            "11": ["16%", "68%", "16%"],
            "01": ["0%", "84%", "16%"],
            "10": ["16%", "84%", "0%"],
            "00": ["0%", "100%", "0%"]
        };
        this.columnChanger = {
            "11": {
                "83": ["01", "left-column"],
                "77": ["10", "right-column"]
            },
            "01": {
                "83": ["11", ""],
                "77": ["00", "both"]
            },
            "10": {
                "83": ["00", "both"],
                "77": ["11", ""]
            },
            "00": {
                "83": ["10", "right-column"],
                "77": ["01", "left-column"]
            }
        };

        //mask for column settings
        this.currentColumns = "11";
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