import Images from "../../images/Images";
import Scene from "../../core/Scene";
import { SpriteMaterial, Sprite as THREESprite } from "three";
import Element from "../Element";
import { ENTITY_TYPES } from "../constants";

const validateAnisotropy = anisotropy => {
    const max = Scene.getRenderer().capabilities.getMaxAnisotropy();

    return anisotropy > max ? max : anisotropy;
};

export default class Sprite extends Element {
    constructor(width = 20, height = 20, spriteTexture, options = {}) {
        super(options);

        const { anisotropy = 1, ...rest } = options;
        const texture = Images.get(spriteTexture);

        texture.anisotropy = validateAnisotropy(anisotropy);

        const material = new SpriteMaterial({
            map: texture,
            ...rest,
        });

        const body = new THREESprite(material);
        body.scale.x = width;
        body.scale.y = height;

        this.setBody({ body });
        this.setEntityType(ENTITY_TYPES.SPRITE);
    }

    getRotation() {
        return this.body.material.rotation;
    }

    setRotation(rotation = this.getRotation()) {
        this.body.material.rotation = rotation;
    }

    setSizeAttenuation(attenuation = true) {
        this.body.material.sizeAttenuation = attenuation;
    }

    setDepthTest(depthTest = true) {
        this.body.material.depthTest = depthTest;
    }

    setDepthWrite(depthWrite = true) {
        this.body.material.depthWrite = depthWrite;
    }
}
