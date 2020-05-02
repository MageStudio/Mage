import { GridHelper } from 'three'
import Scene from '../../base/Scene';

export default class Grid {

    constructor(size, division, color1, color2) {
        this.mesh = new GridHelper(size, division, color1, color2);

        Scene.add(this.mesh, this, false);
    }

    update() {}

	render() {}
}
