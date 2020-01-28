import Entity from '../entities/Entity';
import Mesh from '../entities/mesh';
import LightEngine from './LightEngine';
import ModelsEngine from '../models/modelsEngine';
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
		this.updateHolder = true;
		// target mesh for the light (only used by directional light)
		this.target = undefined;

		this.setLight();

		LightEngine.add(this);
	}

	addHolder = (name = 'lightholder') => {
		const mesh = ModelsEngine.getModel(name);

		if (mesh) {
			this.holder = mesh;
			this.holder.setMaterial(MeshBasicMaterial, { wireframe: true, color: LAMP_COLOR });
			this.holder.serializable = false;
			this.holder.position = {
				x: this.light.position.x,
				y: this.light.position.y,
				z: this.light.position.z
			};
		} else {
			console.warn('[Mage] Couldnt load the lamp holder.');
		}
	};

	hasHelper() {
		return !!this.helper && !!this.holder;
	}

	shouldUpdateHolder(value = true) {
		this.updateHolder = Boolean(value);
	}

	// overriding from Entity base class
	set position(position = {}) {
		const { x = 0, y = 0, z = 0 } = position;

		if (this.light) {
	        this.light.position.set(x, y, z);
		}

		if (this.updateHolder && this.holder) {
			this.holder.position = { x, y, z };
		}
	}

	get position() {
		return {
			x: this.light.position.x,
			y: this.light.position.y,
			z: this.light.position.z
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
			console.log("[Mage] You should create your light, first");
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
			console.log("[Mage] You should create your light, first");
		}
	}

	toJSON() {
		return {
			position: { ...this.position },
			color: this.color,
			intensity: this.intensity,
			name: this.name
		}
	}
};
