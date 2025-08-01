import Element from "../Element";
import { ENTITY_TYPES } from "../constants";
import { Images } from "../../images/Images";

import { THREESprite, SpriteNodeMaterial } from "three";

export default class AnimatedSprite extends Element {
    constructor(width = 20, height = 20, spriteTexture, options = {}) {
        super(options);

        const material = new SpriteNodeMaterial({
            map: Images.get(spriteTexture),
            ...options,
        });

        const body = new THREESprite(material);
        body.scale.x = width;
        body.scale.y = height;

        this.width = width;
        this.height = height;
        this.spriteTexture = spriteTexture;

        this.setBody({ body });
        this.setEntityType(ENTITY_TYPES.SPRITE.TYPE);
        this.setEntitySubtype(ENTITY_TYPES.SPRITE.SUBTYPES.ANIMATED_SPRITE);
    }

    toJSON(parseJSON = false) {
        if (this.isSerializable()) {
            return {
                ...super.toJSON(parseJSON),
                width: this.width,
                height: this.height,
                spriteTexture: this.spriteTexture,
            };
        }
    }

    static create(data = {}) {
        const { width, height, spriteTexture, options } = data;

        return new Sprite(width, height, spriteTexture, options);
    }
}
