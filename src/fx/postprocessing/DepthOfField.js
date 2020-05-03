import Scene from '../../base/Scene';
import config from '../../base/config';

import BokehPass from './BokehPass';

export default class DepthOfField extends BokehPass {

    constructor(params) {
        const { w: width, h: height } = config.screen();
        super(
            Scene.scene,
            Scene.getCameraObject(),
            { ...params, width, height });
    }
};
