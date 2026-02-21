import { Object3D } from "three";
import { PARTICLE_EMITTER_TYPES } from "./constants";
import Entity from "../../entities/Entity";
import { ENTITY_TYPES } from "../../entities/constants";
import Scene from "../../core/Scene";
import { generateRandomName } from "../../lib/uuid";
import HelperSprite from "../../entities/base/HelperSprite";
import { TAGS } from "../../lib/constants";

export default class ParticleEmitter extends Entity {
    constructor(options = {}) {
        super({ tag: "particle " });

        const { name = generateRandomName("Emitter") } = options;

        this.options = {
            ...options,
            name,
        };

        this.particleConfig = {};
        this.preset = null;
        this._sceneEmitter = false;
        this.isUsingHelper = undefined;
        this.holder = undefined;

        this.setSystem();
        this.setName(name);
        this.setBody({ body: new Object3D() });
        this.setEntityType(ENTITY_TYPES.PARTICLE.TYPE);
        this.setEntitySubtype(ENTITY_TYPES.PARTICLE.SUBTYPES.EMITTER);
    }

    setParticleConfig(config) {
        this.particleConfig = config;
    }

    getParticleConfig() {
        return this.particleConfig;
    }

    setBody({ body }) {
        this.body = body;

        if (this.hasBody()) {
            this.addToScene();
        }
    }

    addToScene() {
        const { addUniverse = true, skipSceneAdd = false } = this.options;

        if (skipSceneAdd) return;

        if (this.hasBody()) {
            Scene.add(this.getBody(), this, addUniverse);
        }
    }

    isProtonEmitter() {
        return false;
    }

    getType() {
        return PARTICLE_EMITTER_TYPES.SINGLE;
    }

    hasSystem() {
        return !!this.system;
    }

    isSystemDead() {
        return this.hasSystem() && this.system.dead;
    }

    setSystem() {
        // Base implementation is a no-op.
        // Subclasses (ProtonParticleEmitter) override this to create their system.
        this.system = null;
    }

    getSystem() {
        return this.system;
    }

    emit(...options) {
        return this;
    }

    stop() {}

    syncParticleEmitter() {}

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

        // Replace `options` with the serializable particleConfig
        // so that Proton objects (Rate, Initializers, Behaviours) don't end up in JSON
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
    }

    setPosition(where, { updateHolder = true } = {}) {
        super.setPosition(where);

        if (this.hasHolder() && updateHolder) {
            this.holder.setPosition(this.getPosition());
        }
    }

    update(dt) {
        super.update(dt);
        this.syncParticleEmitter();

        if (this.usingHelper()) {
            this.setPosition(this.holder.getPosition(), { updateHolder: false });
        }
    }
}
