import { ENTITY_TYPES } from "../constants";
import Sprite from "./Sprite";

export default class HelperSprite extends Sprite {
    constructor(...options) {
        super(...options);

        this.helperTarget = undefined;
        this.setEntityType(ENTITY_TYPES.HELPER.TYPE);
        this.setEntitySubtype(ENTITY_TYPES.HELPER.SUBTYPES.HELPER_SPRITE);
    }

    setHelperTarget(element) {
        this.helperTarget = element;
    }

    getHelperTarget() {
        return this.helperTarget;
    }
}
