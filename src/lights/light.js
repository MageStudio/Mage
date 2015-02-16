Class("Light", {

	Light : function(color, intensity, position) {
		//this.mesh = new THREE.AmbientLight(color);
		//core.add(this.mesh, this);
		Entity.call(this);
		this.color = color;
		this.intensity = intensity;
		this.position = position || {
			x: 0,
			y: 0,
			z: 0
		};
		this.isLightOn = false;
		this.mesh = undefined;
	},

	on: function() {
		if (this.light) {
			var self = this;
			var _delay = function() {
				self.light.intensity += Light.delayFactor;
				if (self.light.intensity < self.intensity) {
					setTimeout(_delay, Light.delayStep);
				} else {
					self.isLightOn = true;
				}
			}
			_delay();
		} else {
			console.log("You should create your light, first");
		}
	},

	off: function() {
		if (this.light) {
			var self = this;
			var _delay = function() {
				self.light.intensity -= Light.delayFactor;
				if (self.light.intensity > 0) {
					setTimeout(_delay, Light.delayStep);
				} else {
					self.isLightOn = false;
				}
			}
			_delay();
		} else {
			console.log("You should create your light, first");
		}
	}

})._extends("Entity");

Light.delayFactor = 0.1;
Light.delayStep = 30;
Light.holderRadius = 0.01;
Light.holderSegments = 1;