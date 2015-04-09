all: compile

compile:
	coffee -co compiled src/*.coffee
	coffee -co compiled/core src/core/*.coffee
	coffee -co compiled/devices src/devices/*.coffee
	coffee -co compiled/entities src/entities/*.coffee
	coffee -co compiled/managers src/managers/*.coffee
