import Proton from "three.proton";
import { SpriteMaterial, Sprite, AdditiveBlending } from "three";
import ParticleEmitter from "./ParticleEmitter";
import Images from "../../images/Images";
import PALETTES from "../../lib/palettes";
import { ENTITY_TYPES } from "../../entities/constants";

const DEFAULT_PARTICLE_COLOR = PALETTES.BASE.BLACK;
const SYSTEM_DISPOSE_TIMEOUT = 700;

export default class ProtonParticleEmitter extends ParticleEmitter {
    constructor(options = {}) {
        const {
            initializers = [],
            behaviours = [],
            texture = false,
            color = DEFAULT_PARTICLE_COLOR,
            rate,
            ...rest
        } = options;

        const parsedOptions = {
            initializers,
            behaviours,
            texture,
            color,
            rate,
            ...rest,
        };

        super(parsedOptions);
        this.setEntitySubtype(ENTITY_TYPES.PARTICLE.SUBTYPES.PROTON_EMITTER);
    }

    isProtonEmitter() {
        return true;
    }
    isSystemDead() {
        return this.system.dead;
    }

    createParticleBody(texture, color) {
        return new Sprite(
            new SpriteMaterial({
                map: Images.get(texture),
                transparent: true,
                color,
                blending: AdditiveBlending,
                depthWrite: false,
                fog: true,
            }),
        );
    }

    setSystem() {
        const { initializers = [], behaviours = [], texture, color, rate } = this.options;

        this.system = new Proton.Emitter();
        this.system.rate = rate;

        initializers.forEach(initializer => this.system.addInitialize(initializer));

        if (texture) {
            this.system.addInitialize(new Proton.Body(this.createParticleBody(texture, color)));
        }

        behaviours.forEach(behaviour => this.system.addBehaviour(behaviour));
    }

    emit(duration = "once", life) {
        if (this.hasSystem()) {
            this.system.emit(duration, life);
        }

        return this;
    }

    stop() {
        if (this.hasSystem()) {
            this.system.stopEmit();
        }
    }

    syncParticleEmitter() {
        const { position, rotation } = this.getWorldTransform();

        this.system.rotation.x = rotation.x;
        this.system.rotation.y = rotation.y;
        this.system.rotation.z = rotation.z;

        this.system.p.x = position.x;
        this.system.p.y = position.y;
        this.system.p.z = position.z;
    }

    disposeSystem = () => {
        if (this.hasSystem()) {
            this.system.removeAllParticles();
            this.system.destroy();
        }
    };

    dispose() {
        super.dispose();
        this.stop();
        setTimeout(this.disposeSystem, SYSTEM_DISPOSE_TIMEOUT);
    }
}
