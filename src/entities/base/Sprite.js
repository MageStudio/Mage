import Images from "../../images/Images";
import Scene from "../../core/Scene";
import { SpriteMaterial, Sprite as THREESprite } from "three";
import Element from "../Element";
import { ENTITY_TYPES } from "../constants";
import { cap } from "../../lib/math";
import { TEXTURES } from "../../lib/constants";

const validateAnisotropy = anisotropy => {
    const max = Scene.getRenderer().capabilities.getMaxAnisotropy();

    return cap(anisotropy, max);
};

export default class Sprite extends Element {
    constructor(width = 20, height = 20, spriteTexture, options = {}) {
        super({
            width,
            height,
            spriteTexture,
            ...options,
        });

        const {
            anisotropy = 1,
            sizeAttenuation = true,
            depthTest = true,
            depthWrite = true,
            ...rest
        } = options;
        const texture = Images.get(spriteTexture);
        this.recordTexture(spriteTexture, TEXTURES.MAP);

        this.width = width;
        this.height = height;
        this.spriteTexture = spriteTexture;

        this.setAnisotropy(anisotropy);

        const material = new SpriteMaterial({
            map: texture,
            ...rest,
        });

        const body = new THREESprite(material);
        this.setBody({ body });

        this.setWidth(width);
        this.setHeight(height);
        this.setSizeAttenuation(sizeAttenuation);
        this.setDepthTest(depthTest);
        this.setDepthWrite(depthWrite);
        this.setEntityType(ENTITY_TYPES.SPRITE.TYPE);
        this.setEntitySubtype(ENTITY_TYPES.SPRITE.SUBTYPES.DEFAULT);
    }

    getRotation() {
        return this.getBody().material.rotation;
    }

    setRotation(rotation = this.getRotation()) {
        this.setData("rotation", rotation);
        this.getBody().material.rotation = rotation;
    }

    setWidth(width = this.width) {
        this.setData("width", width);
        this.getBody().scale.x = width;
    }

    setHeight(height = this.height) {
        this.setData("height", height);
        this.getBody().scale.y = height;
    }

    setAnisotropy(anisotropy = 1) {
        this.setData("anisotropy", anisotropy);
        this.getTexture(TEXTURES.MAP).anisotropy = validateAnisotropy(anisotropy);
    }

    setSizeAttenuation(attenuation = true) {
        this.setData("sizeAttenuation", attenuation);
        this.getBody().material.sizeAttenuation = attenuation;
    }

    setDepthTest(depthTest = true) {
        this.setData("depthTest", depthTest);
        this.getBody().material.depthTest = depthTest;
    }

    setDepthWrite(depthWrite = true) {
        this.setData("depthWrite", depthWrite);
        this.getBody().material.depthWrite = depthWrite;
    }

    toJSON(parseJSON = false) {
        if (this.isSerializable()) {
            return {
                ...super.toJSON(parseJSON),
                width: this.width,
                height: this.height,
                spriteTexture: this.spriteTexture,
                anisotropy: this.getBody().material.anisotropy,
                sizeAttenuation: this.getBody().material.sizeAttenuation,
                depthTest: this.getBody().material.depthTest,
                depthWrite: this.getBody().material.depthWrite,
            };
        }
    }

    static create(data = {}) {
        const { width, height, spriteTexture, options } = data;

        return new Sprite(width, height, spriteTexture, options);
    }
}
