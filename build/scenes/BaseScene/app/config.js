var config = {};

config = {
	physics_enabled : false,
	tween_enabled : true,
	cast_shadow : true,
	frameRate: 60,
	h : window.innerHeight,
    w : window.innerWidth,
    ratio : (window.innerWidth/window.innerHeight),
	camera : {
		fov: 45,
		ratio: (window.innerWidth / window.innerHeight),
		near: 1,
		far: 5000
	}
};
