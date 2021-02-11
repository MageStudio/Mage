import {
    BoxGeometry,
    MeshBasicMaterial
} from 'three';
import { Element, ENTITY_TYPES } from '../index';

export default class Box extends Element {

    constructor(width = 10, height = 10, depth = 10, color, options = {}) {
        super(null, null, options);

        const geometry = new BoxGeometry(width, height, depth);
        const material = new MeshBasicMaterial({
            color: color,
            wireframe: false,
            ...options
        });

        this.setBody({ geometry, material });
        this.setEntityType(ENTITY_TYPES.MESH);
    }
}
