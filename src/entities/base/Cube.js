import {
    CubeGeometry,
    MeshBasicMaterial
} from 'three';
import { Element, ENTITY_TYPES } from '../index';

export default class Cube extends Element {

    constructor(side = 10, color, options = {}) {
        super(null, null, options);

        const geometry = new CubeGeometry(side, side, side);
        const material = new MeshBasicMaterial({
            color: color,
            wireframe: false,
            ...options
        });
        
        this.setBody({ geometry, material });
        this.setEntityType(ENTITY_TYPES.MESH);
    }
}
