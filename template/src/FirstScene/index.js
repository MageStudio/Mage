export FirstScene from './App';

export const assets = {
	Audio : {

	},

	Video : {

	},

	Images : {

	},

	Textures: {

	},

	Models : {

	},

	General : {
		//whatever file you need to load
	}
};

export const game = {
	screen: {
		h : window ? window.innerHeight : DEFAULT_HEIGHT,
		w : window ? window.innerWidth : DEFAULT_WIDTH,
		ratio : window ? (window.innerWidth/window.innerHeight) : DEFAULT_RATIO,
		frameRate : 60,
		alpha: true
	},

	lights: {
		shadows: true
	},

	physics: {
		enabled: false
	},

	tween: {
		enabled: false
	},

	camera : {
		//handling useful informations about our camera.
		fov : 75,
		near : 0.1,
		far : 3000000
	}
};
