import { GridHelper } from 'three'
import Element from '../Element';
import { ENTITY_TYPES }  from '../constants';

export default class Grid extends Element {

    constructor(size, division, color1, color2) {
        const options = {
            size,
            division,
            color1,
            color2
        };

        super(null, null, options);
        const body = new GridHelper(size, division, color1, color2);

        this.setBody({ body });
        this.setEntityType(ENTITY_TYPES.MESH);
    }

    update() {}
}
