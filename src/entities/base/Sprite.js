import { Images } from "../../images/Images";

import {
    SpriteMaterial,
    Sprite as THREESprite
} from 'three';
import { BaseMesh, ENTITY_TYPES } from '../index';


export default class Sprite extends BaseMesh {

    constructor(width = 20, height = 20, spriteTexture, options = {}) {
        super(null, null, options);

        const material = new SpriteMaterial({
            map: Images.get(spriteTexture),
            ...options
        });

        const mesh = new THREESprite(material);
        mesh.scale.x = width;
        mesh.scale.y = height;

        this.setMesh({ mesh });
        this.setEntityType(ENTITY_TYPES.SPRITE);
    }
}