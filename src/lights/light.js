import Entity from '../entities/Entity';
import LightEngine from './LightEngine';

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
		LightEngine.add(this);
	}

	on() {
		if (this.light) {
			const delay = () => {
				this.light.intensity += LightEngine.delayFactor;
				if (this.light.intensity < this.intensity) {
					setTimeout(_delay, LightEngine.delayStep);
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
				this.light.intensity -= LightEngine.delayFactor;
				if (this.light.intensity > 0) {
					setTimeout(_delay, LightEngine.delayStep);
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
