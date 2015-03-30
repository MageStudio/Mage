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
                "49": ["01", "left-column"],
                "50": ["10", "right-column"]
            },
            "01": {
                "49": ["11", ""],
                "50": ["00", "both"]
            },
            "10": {
                "49": ["00", "both"],
                "50": ["11", ""]
            },
            "00": {
                "49": ["10", "right-column"],
                "50": ["01", "left-column"]
            }
        };

        //mask for column settings
        this.currentColumns = "11";
    }
});