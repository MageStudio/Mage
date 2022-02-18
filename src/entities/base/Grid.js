import { GridHelper } from 'three'
import { Element, ENTITY_TYPES } from '../index';

export default class Grid extends Element {

    constructor(size, division, color1, color2) {
        const options = {
            size,
            division,
            color1,
            color2
        };

        super(null, null, options);
        this.body = new GridHelper(size, division, color1, color2);

        this.setBody({ body });
        this.setEntityType(ENTITY_TYPES.MESH);
    }

    update() {}
}
