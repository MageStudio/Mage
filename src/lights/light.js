import Entity from '../entities/Entity';
import LightEngine from './LightEngine';

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

		LightEngine.add(this);
	}

	hasHelper() {
		return !!this.helper && !!this.holder;
	}

	// overriding from Entity base class
	position(position = {}) {
		const { x = 0, y = 0, z = 0 } = position;

		if (this.light) {
	        this.light.position.set(x, y, z);
		}

		if (this.holder) {
			this.holder.position({ x, y, z });
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
};
