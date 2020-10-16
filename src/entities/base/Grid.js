import { GridHelper } from 'three'
import Scene from '../../core/Scene';

export default class Grid {

    constructor(size, division, color1, color2) {
        this.body = new GridHelper(size, division, color1, color2);

        Scene.add(this.body, this, false);
    }

    update() {}

	render() {}
}
