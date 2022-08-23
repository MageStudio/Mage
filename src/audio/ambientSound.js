import { ENTITY_TYPES } from "../entities/constants";
import { generateRandomName } from "../lib/uuid";
import Sound from "./Sound";
export default class AmbientSound extends Sound {

    constructor(source, { name = generateRandomName('AmbientSound'), ...options } = {}) {
        super({ source, name, ...options });
        console.log('ambientsound created');

        this.setEntityType(ENTITY_TYPES.AUDIO.AMBIENT);
        this.connect();
    }
}