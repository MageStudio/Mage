import Entity from '../entities/Entity';
import LightEngine from './LightEngine';
import { Vector3 } from 'three';

console.log('logging entity', Entity);

export default class Light extends Entity {

	constructor(color, intensity) {
		//this.mesh = new THREE.AmbientLight(color);
		//app.add(this.mesh, this);
		super();
		this.color = color;
		this.intensity = intensity;
		this.isLightOn = false;
		this.mesh = undefined;
		this.setLight();

		LightEngine.add(this);
	}

	setPosition(position = {}) {
		const { x = 0, y = 0, z = 0 } = position;
		this.position = {
			x,
			y,
			z
		};
		if (this.light) {
	        this.light.position.set(x, y, z);
		}

		if (this.mesh) {
			this.mesh.mesh.position.set(x, y, z);
		}
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
};
