import { BaseMesh, ENTITY_TYPES } from "./index";
import { Images } from "../../images/Images";

import {
    Sprite
} from 'three';

export default class AnimatedSprite extends BaseMesh {

    constructor(width = 20, height = 20, spriteTexture, options = {}) {
        super(null, null, options);

        const material = new SpriteNodeMaterial({
            map: Images.get(spriteTexture),
            ...options
        });

        const mesh = new Sprite(material);
        mesh.scale.x = width;
        mesh.scale.y = height;

        this.setMesh({ mesh });
        this.setEntityType(ENTITY_TYPES.SPRITE);
    }
}