import Entity from '../entities/entity';

export default class Light extends Entity {

	constructor(color, intensity, position) {
		//this.mesh = new THREE.AmbientLight(color);
		//app.add(this.mesh, this);
		super();
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
	}

	on() {
		if (this.light) {
			const delay = () => {
				this.light.intensity += M.lightEngine.delayFactor;
				if (this.light.intensity < this.intensity) {
					setTimeout(_delay, M.lightEngine.delayStep);
				} else {
					this.isLightOn = true;
				}
			}
			delay();
		} else {
			console.log("You should create your light, first");
		}
	}

	off() {
		if (this.light) {
			const delay = () => {
				this.light.intensity -= M.lightEngine.delayFactor;
				if (this.light.intensity > 0) {
					setTimeout(_delay, M.lightEngine.delayStep);
				} else {
					this.isLightOn = false;
				}
			}
			delay();
		} else {
			console.log("You should create your light, first");
		}
	}
}
