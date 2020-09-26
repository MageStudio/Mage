import Images from "../../images/Images";
import Scene from '../../core/Scene';
import {
    SpriteMaterial,
    Sprite as THREESprite
} from 'three';
import { Element, ENTITY_TYPES } from '../index';

const validateAnisotropy = (anisotropy) => {
    const max = Scene
        .getRenderer()
        .capabilities
        .getMaxAnisotropy();

    return anisotropy > max ? max : anisotropy;
};

export default class Sprite extends Element {

    constructor(width = 20, height = 20, spriteTexture, options = {}) {
        super(null, null, options);

        const { anisotropy = 1, ...rest } = options;
        const texture = Images.get(spriteTexture);

        texture.anisotropy = validateAnisotropy(anisotropy);

        const material = new SpriteMaterial({
            map: texture,
            ...rest
        });

        const mesh = new THREESprite(material);
        mesh.scale.x = width;
        mesh.scale.y = height;

        this.setMesh({ mesh });
        this.setEntityType(ENTITY_TYPES.SPRITE);
    }
}