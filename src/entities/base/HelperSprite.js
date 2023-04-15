import Sprite from "./Sprite";

export default class HelperSprite extends Sprite {
    constructor(...options) {
        super(...options);

        this.helperTarget = undefined;
    }

    setHelperTarget(element) {
        this.helperTarget = element;
    }

    getHelperTarget() {
        return this.helperTarget;
    }
}
