all: compile test

compile:
	coffee -co compiled src/*.coffee
	coffee -co compiled/audio src/audio/*.coffee
	coffee -co compiled/controls src/controls/*.coffee
	coffee -co compiled/core src/core/*.coffee
	coffee -co compiled/devices src/devices/*.coffee
	coffee -co compiled/entities src/entities/*.coffee
	coffee -co compiled/fx src/fx/*.coffee
	coffee -co compiled/managers src/managers/*.coffee

test:
	cd coffeetest && python build.py
	coffee -co coffeetest/app coffeetest/app/*.coffee
	coffee -co coffeetest/app/scripts/camera coffeetest/app/scripts/camera/*.coffee
	coffee -co coffeetest/app/scripts/cube coffeetest/app/scripts/cube/*.coffee
