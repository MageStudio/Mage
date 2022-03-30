import {
    BoxGeometry,
    MeshBasicMaterial
} from 'three';
import Element from '../Element';
import { ENTITY_TYPES }  from '../constants';

export default class Cube extends Element {

    constructor(side = 10, color, options = {}) {
        super(options);

        const geometry = new BoxGeometry(side, side, side);
        const material = new MeshBasicMaterial({
            color: color,
            wireframe: false,
            ...options
        });
        
        this.setBody({ geometry, material });
        this.setEntityType(ENTITY_TYPES.MESH);
    }
}
