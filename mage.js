#!/usr/bin/env node
"use strict"

var builder = require("./builder.js"),
	server = require('./server.js'),
	colors = require('colors');

module.exports = {
		builder: builder,
		server: server
};

if (process.argv.length) {

	function intro() {
		console.log("\n\n\n--- Mage is a WebGL Game Engine. ---");
		console.log("written by Marco Stagni, thanks MrDoob.");
		console.log("----- < http://marcostagni.com > -----\n\n\n");
	}

	function usage() {
		console.log("USAGE: mage create <project>".green);
		console.log("USAGE: mage serve <port> <project>".green);
		console.log("\n\n");
	}

	if (process.argv.length > 2) {

		var command = process.argv[2];

		if (command == "create") {
			intro();

			var location = process.argv[3];
			if (location) {
				builder.create(location)
			} else {
				console.log('Please provide a location for the project'.red);
				usage();
			}
		} else if (command == 'serve') {
			intro();

			var port = process.argv[3] ? process.argv[3] : 8000,
				location = process.argv[4] ? process.argv[4] : false;

			server.start(port, location);
		} else if (command == '--help') {
			usage();
		} else{
			console.log("Sorry, only create and serve methods avaible right now.".red);
			usage();
		}
	} else {
		usage();
	}
}
