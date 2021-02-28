import Scene from '../../core/Scene';
import config from '../../core/config';

import BokehPass from './BokehPass';

export default class DepthOfField extends BokehPass {

    constructor(params) {
        const { w: width, h: height, ratio: aspect } = config.screen();
        super(
            Scene.scene,
            Scene.getCameraBody(),
            { ...params, width, height, aspect });
    }
};
