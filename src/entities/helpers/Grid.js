import { GridHelper } from 'three'
import SceneManager from '../../base/SceneManager';

export default class Grid {

    constructor(size, division, color1, color2) {
        this.mesh = new GridHelper(size, division, color1, color2);

        SceneManager.add(this.mesh, this);
    }

    update() {}

	render() {}
}
