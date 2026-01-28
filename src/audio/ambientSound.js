import { ENTITY_TYPES } from "../entities/constants";
import { generateRandomName } from "../lib/uuid";
import Sound from "./sound";
export default class AmbientSound extends Sound {
    constructor(source, { name = generateRandomName("AmbientSound"), ...options } = {}) {
        super({ source, name, ...options });
        this.setEntityType(ENTITY_TYPES.AUDIO.TYPE);
        this.setEntitySubtype(ENTITY_TYPES.AUDIO.SUBTYPES.AMBIENT);
    }

    static create(data = {}) {
        const { source, loop, loopStart, loopEnd, autoplay, reconnectOnReset, name, options = {} } = data;
        return new AmbientSound(source, {
            loop,
            loopStart,
            loopEnd,
            autoplay,
            reconnectOnReset,
            name,
            ...options
        });
    }
}
