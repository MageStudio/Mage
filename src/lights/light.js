import Entity from '../entities/Entity';
import Mesh from '../entities/mesh';
import Lights from './Lights';
import Models from '../models/Models';
import {
	ObjectLoader,
	MeshBasicMaterial
} from 'three';

const LAMP_COLOR = 0Xf1c40f;

export default class Light extends Entity {

	constructor({ color, intensity, name }) {
		super({ name });
		this.color = color;
		this.intensity = intensity;
		this.name = name || `light_${Math.random() * 1000}`;
		this.isLightOn = false;
		this.mesh = undefined;

		// helper mesh for this light
		this.helper = undefined;
		// holder mesh representing the light
		this.holder = undefined;
		// target mesh for the light (only used by directional light)
		this.target = undefined;

		this.setLight();

		Lights.add(this);
	}

	addHolder = (name = 'lightholder') => {
		const mesh = Models.getModel(name);

		if (mesh) {
			this.holder = mesh;
			this.holder.setMaterial(MeshBasicMaterial, { wireframe: true, color: LAMP_COLOR });
			this.holder.serializable = false;
			this.holder.position({
				x: this.light.position.x,
				y: this.light.position.y,
				z: this.light.position.z
			});
		} else {
			console.warn('[Mage] Couldnt load the lamp holder.');
		}
	};

	hasHelper() {
		return !!this.helper && !!this.holder;
	}

	// overriding from Entity base class
	position(position = {}, updateHolder = true) {
		const { x = 0, y = 0, z = 0 } = position;

		if (this.light) {
	        this.light.position.set(x, y, z);
		}

		if (updateHolder && this.holder) {
			this.holder.position({ x, y, z });
		}
	}

	isAlreadyOn() {
		return this.light && this.light.intensity === this.intensity;
	}

	isAlreadyOff() {
		return this.light && this.light.intensity <= 0;
	}

	setIntensity(value) {
		if (this.light) {
			this.light.intensity = value;
		}
	}

	dim(value, speed, factor) {
		// goes to value decreasing by factor. It takes speed ms to get to value.
		console.warn('[Mage] Not implemented.', value, speed, factor);
	}

	on() {
		if (this.light) {
			const delay = () => {
				this.light.intensity += Lights.delayFactor;
				if (this.light.intensity < this.intensity) {
					setTimeout(delay, Lights.delayStep);
				} else {
					this.isLightOn = true;
				}
			}
			delay();
		} else {
			console.log("[Mage] You should create your light, first");
		}
	}

	off() {
		if (this.light) {
			const delay = () => {
				this.light.intensity -= Lights.delayFactor;
				if (this.light.intensity > 0) {
					setTimeout(delay, Lights.delayStep);
				} else {
					this.isLightOn = false;
				}
			}
			delay();
		} else {
			console.log("[Mage] You should create your light, first");
		}
	}

	toJSON() {
		const { x, y, z } = this.light.position;

		return {
			position: { x, y, z },
			color: this.color,
			intensity: this.intensity,
			name: this.name
		}
	}
};
