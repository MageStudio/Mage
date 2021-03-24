import { GridHelper } from 'three'
import RenderPipeline from '../../render/RenderPipeline';

export default class Grid {

    constructor(size, division, color1, color2) {
        this.body = new GridHelper(size, division, color1, color2);

        RenderPipeline.add(this.body, this, false);
    }

    update() {}

	render() {}
}
