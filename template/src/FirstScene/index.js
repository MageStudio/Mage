export FirstScene from './somewhere';

export const assets = {
	Audio : {
		"rain" : "assets/audio/rain.mp3"
	},

	Video : {

	},

	Images : {

	},

	Textures: {

	},

	General : {
		//whatever file you need to load
	}
};

export const game = {
    physics_enabled: false,
	tween_enabled: true,
	cast_shadow: true,
	frameRate: 60,
	h: window && window.innerHeight,
    w: window && window.innerWidth,
    ratio:  window && (window.innerWidth/window.innerHeight),
	camera: {
		fov: 45,
		ratio:  window && (window.innerWidth / window.innerHeight),
		near: 1,
		far: 3000000
	}
};
