import { Object3D } from "three";
import { EMITTER_NOT_FOUND, ELEMENT_NOT_SET } from "../../lib/messages";
import { PARTICLE_EMITTER_TYPES } from "./constants";
import Entity from "../../entities/Entity";
import { ENTITY_TYPES } from "../../entities/constants";
import Scene from "../../core/Scene";
import { generateRandomName } from "../../lib/uuid";
import HelperSprite from "../../entities/base/HelperSprite";
import { TAGS } from "../../lib/constants";

export default class ParticleEmitterGroup extends Entity {
    constructor(options = {}) {
        super({ tag: "particle " });

        const {
            name = generateRandomName("EmitterGroup"),
            system,
            autoEmit = false,
            emitWhenEditing = false,
        } = options;

        this.options = {
            ...options,
            name,
            autoEmit,
            emitWhenEditing,
        };
        this.system = new Map();
        this.particleConfig = {};
        this.preset = null;
        this._sceneEmitter = false;
        this.isUsingHelper = undefined;
        this.holder = undefined;

        this.setBody({ body: new Object3D() });
        this.setName(name);
        this.setEntityType(ENTITY_TYPES.PARTICLE.TYPE);
        this.setEntitySubtype(ENTITY_TYPES.PARTICLE.SUBTYPES.EMITTER_GROUP);
        this.setSystem(system);

        if (autoEmit || emitWhenEditing) {
            this.emit();
        }
    }

    setBody({ body }) {
        this.body = body;

        if (this.hasBody()) {
            this.addToScene();
        }
    }

    addToScene() {
        const { addUniverse = true } = this.options;

        if (this.hasBody()) {
            Scene.add(this.getBody(), this, addUniverse);
        } else {
            console.warn(ELEMENT_NOT_SET);
        }
    }

    isProtonEmitter() {
        let result = false;
        this.system.forEach(emitter => {
            if (emitter.isProtonEmitter()) result = true;
        });
        return result;
    }

    getType() {
        return PARTICLE_EMITTER_TYPES.GROUP;
    }

    hasSystem() {
        return !!this.system && !!this.system.size > 0;
    }

    isSystemDead() {
        let allDead = true;
        this.system.forEach(emitter => {
            if (!emitter.isSystemDead()) allDead = false;
        });
        return this.system.size > 0 && allDead;
    }

    setSystem(system = []) {
        system.forEach(emitter => {
            this.add(emitter);
            this.system.set(emitter.getName(), emitter);
        });
    }

    getSystem() {
        return this.system;
    }

    getEmitter(name) {
        const emitter = this.system.get(name);

        if (emitter) {
            return emitter;
        } else {
            console.log(EMITTER_NOT_FOUND, name);
        }
    }

    forEach(cb) {
        this.system.forEach(emitter => cb(emitter));
    }

    emit(duration, life) {
        if (this.hasSystem()) {
            const d = duration !== undefined ? duration : this.getEmitDurationValue();
            this.system.forEach(emitter => emitter.emit(d, life));
        }
    }

    stop() {
        if (this.hasSystem()) {
            this.system.forEach(emitter => emitter.stop());
        }
    }

    // Override in subclasses to rebuild from particleConfig
    rebuild() {}

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
        return this.getEmitDuration();
    }

    setParticleConfig(config) {
        this.particleConfig = config;
    }

    getParticleConfig() {
        return this.particleConfig;
    }

    addHolder(name = "particleholder", size = 0.15) {
        const holderSprite = new HelperSprite(size, size, name, { name });

        if (holderSprite) {
            holderSprite.setSizeAttenuation(false);
            holderSprite.setDepthTest(false);
            holderSprite.setDepthWrite(false);
            holderSprite.setSerializable(false);
            holderSprite.setPosition(this.getPosition());
            holderSprite.addTags([TAGS.HELPER, TAGS.PARTICLES.HELPER, TAGS.PARTICLES.HOLDER, name]);
            holderSprite.setHelperTarget(this);
            this.holder = holderSprite;
            return true;
        }

        return false;
    }

    addHelpers({ holderName = "particleholder", holderSize = 0.15 } = {}) {
        this.addHolder(holderName, holderSize);
        this.isUsingHelper = true;
    }

    usingHelper() {
        return !!this.isUsingHelper;
    }

    hasHolder() {
        return !!this.holder;
    }

    setPosition(where, { updateHolder = true } = {}) {
        super.setPosition(where);

        if (this.hasHolder() && updateHolder) {
            this.holder.setPosition(this.getPosition());
        }
    }

    setPreset(preset) {
        this.preset = preset;
    }

    getPreset() {
        return this.preset;
    }

    setSceneEmitter(value) {
        this._sceneEmitter = !!value;
    }

    isSceneEmitter() {
        return this._sceneEmitter;
    }

    toJSON(parseJSON = false) {
        const base = super.toJSON(parseJSON);
        if (!base) return base;

        return {
            ...base,
            preset: this.preset,
            options: this.particleConfig,
        };
    }

    dispose() {
        if (this.holder) {
            this.holder.dispose();
            this.holder = undefined;
        }
        super.dispose();
        this.system.forEach(emitter => emitter.dispose());
    }

    update(dt) {
        super.update(dt);

        if (this.usingHelper()) {
            this.setPosition(this.holder.getPosition(), { updateHolder: false });
        }

        if (this.hasSystem()) {
            this.system.forEach(emitter => emitter.update(dt));
        }
    }
}
