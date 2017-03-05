Class("Light", {

	Light : function(color, intensity, position) {
		//this.mesh = new THREE.AmbientLight(color);
		//app.add(this.mesh, this);
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
		M.lightEngine.add(this);
	},

	on: function() {
		if (this.light) {
			var self = this;
			var _delay = function() {
				self.light.intensity += M.lightEngine.delayFactor;
				if (self.light.intensity < self.intensity) {
					setTimeout(_delay, M.lightEngine.delayStep);
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
				self.light.intensity -= M.lightEngine.delayFactor;
				if (self.light.intensity > 0) {
					setTimeout(_delay, M.lightEngine.delayStep);
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
