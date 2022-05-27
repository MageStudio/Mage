import Particles, { PARTICLES } from "../../fx/particles/Particles";

import BaseScript from "../BaseScript"

export default class Trails extends BaseScript {

    constructor() {
        super('Trails');
    }

    start(element, { texture = false, size }) {
        this.element = element;
        this.emitter = Particles.add(PARTICLES.TRAIL, { texture, size });

        this.emitter.start(Infinity);
    }

    stop() {
        this.emitter.dispose();
    }

    update() {
        this.emitter.setPosition(this.element.getPosition());
    }
}