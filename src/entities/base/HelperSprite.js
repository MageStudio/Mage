import { ENTITY_TYPES } from "../constants";
import Sprite from "./Sprite";

export default class HelperSprite extends Sprite {
    constructor(...options) {
        super(...options);

        this.helperTarget = undefined;
        this.setEntityType(ENTITY_TYPES.HELPER.TYPE);
        this.setEntitySubtype(ENTITY_TYPES.HELPER.SUBTYPES.HELPER_SPRITE);

        // Set to layer 1 ONLY so mirrors don't render helper sprites
        // Main camera must enable layer 1 to see these
        if (this.hasBody()) {
            this.getBody().layers.set(1);
        }
    }

    setHelperTarget(element) {
        this.helperTarget = element;
    }

    getHelperTarget() {
        return this.helperTarget;
    }
}
