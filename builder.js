function Builder() {

	this.ncp = require("ncp").ncp;
	this.colors = require("colors");

	Builder.prototype.create = function ( projectName ) {
		
		/*
			this must copy the whole build folder
		*/

		console.log("...".blue);
		console.log("This script will create your ");
		console.log("project in just a few seconds.");
		

		this.ncp("/usr/local/lib/node_modules/wage/build", projectName, function (err) {
			if (err) {
				console.log("\n\nSomething went wrong.");
				console.error(err);
				return console.log("...".blue);
			} else {
				console.log("Your project is ok, enjoy!");
				return console.log("...\n\n".blue);
			}
		});

		return "...";
	}
}

module.exports = new Builder();