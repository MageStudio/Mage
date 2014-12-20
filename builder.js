//this should be our app builder

function Builder() {

	this.ncp = require("ncp").ncp;

	Builder.prototype.create = function ( projectName ) {
		
		/*
			this must copy the whole build folder
		*/

		console.log("------------------------------");
		console.log("This script will create your ");
		console.log("project in just a few seconds.");
		

		this.ncp("node_modules/wage/build", projectName, function (err) {
			if (err) {
				console.log("\n\nSomething went wrong.");
				console.error(err);
				return console.log("------------------------------");
			} else {
				console.log("Your project is ok, enjoy!");
				return console.log("------------------------------");
			}
		});

		return "...";
	}
}

module.exports = new Builder();