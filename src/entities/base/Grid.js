import { GridHelper } from "three";
import Element from "../Element";
import { ENTITY_TYPES } from "../constants";
import { generateRandomName } from "../../lib/uuid";
import Color from "../../lib/Color";

export default class Grid extends Element {
    constructor(
        size,
        division,
        color1 = Color.randomColor(true),
        color2 = Color.randomColor(true),
    ) {
        const options = {
            size,
            division,
            color1,
            color2,
            name: generateRandomName("GridHelper"),
        };

        super(options);
        const body = new GridHelper(size, division, color1, color2);

        this.setBody({ body });
        this.setEntityType(ENTITY_TYPES.HELPER.TYPE);
        this.setEntitySubtype(ENTITY_TYPES.HELPER.SUBTYPES.GRID);
    }

    update() {}
}
