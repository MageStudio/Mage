import { EventDispatcher } from "three";

export const REQUIREMENTS_EVENTS = {
    MISSING: "requirements:missing",
    FULFILLED: "requirements:fulfilled",
};

export const MODELS_REQUIREMENTS = {
    TEXTURE: "texture",
    MATERIAL: "material",
    BINARY: "binary",
};

export default class RequirementsTracer extends EventDispatcher {
    constructor() {
        super();
        this.requirements = [];
    }

    trace(requirement) {
        this.requirements.push(requirement);
        this.dispatchEvent({ type: REQUIREMENTS_EVENTS.MISSING, requirements: this.requirements });
    }
}
