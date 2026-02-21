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
            autoEmit = false,
            emitWhenEditing = false,
            ...rest
        } = options;

        const parsedOptions = {
            initializers,
            behaviours,
            texture,
            color,
            rate,
            autoEmit,
            emitWhenEditing,
            ...rest,
        };

        super(parsedOptions);
        this.setEntitySubtype(ENTITY_TYPES.PARTICLE.SUBTYPES.PROTON_EMITTER);

        if (autoEmit || emitWhenEditing) {
            this.emit();
        }
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

    rebuildSystem({ rate, initializers = [], behaviours = [], texture, color }) {
        const wasEmitting = this.hasSystem() && !this.system.dead;

        if (this.hasSystem()) {
            this.system.stopEmit();
            this.system.removeAllParticles();
            // Clear existing initializers and behaviours
            this.system.initializes.length = 0;
            this.system.behaviours.length = 0;
        }

        // Update options so setSystem can re-read if needed
        this.options = {
            ...this.options,
            rate,
            initializers,
            behaviours,
            texture,
            color,
        };

        // Set new rate
        this.system.rate = rate;

        // Re-add initializers
        initializers.forEach(init => this.system.addInitialize(init));

        if (texture) {
            this.system.addInitialize(new Proton.Body(this.createParticleBody(texture, color)));
        }

        // Re-add behaviours
        behaviours.forEach(beh => this.system.addBehaviour(beh));

        // Re-emit if was emitting
        if (wasEmitting) {
            this.emit();
        }
    }

    // Override in subclasses to rebuild from particleConfig
    rebuild() {}

    setTexture(texture) {
        this.particleConfig.texture = texture;
        this.rebuild();
    }

    getTexture() {
        return this.particleConfig.texture;
    }

    setAutoEmit(autoEmit) {
        this.particleConfig.autoEmit = autoEmit;
    }

    getAutoEmit() {
        return this.particleConfig.autoEmit;
    }

    setEmitWhenEditing(emitWhenEditing) {
        this.particleConfig.emitWhenEditing = emitWhenEditing;
    }

    getEmitWhenEditing() {
        return this.particleConfig.emitWhenEditing;
    }

    setEmitMode(emitMode) {
        this.particleConfig.emitMode = emitMode;
    }

    getEmitMode() {
        return this.particleConfig.emitMode || "continuous";
    }

    setEmitDuration(emitDuration) {
        this.particleConfig.emitDuration = emitDuration;
    }

    getEmitDuration() {
        return this.particleConfig.emitDuration || 1;
    }

    getEmitDurationValue() {
        const mode = this.getEmitMode();
        if (mode === "continuous") return Infinity;
        if (mode === "burst") return 0.1;
        // timed
        return this.getEmitDuration();
    }

    emit(duration, life) {
        if (this.hasSystem()) {
            const d = duration !== undefined ? duration : this.getEmitDurationValue();
            this.system.emit(d, life);
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
