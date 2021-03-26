import config from '../../core/config';

import BokehPass from './BokehPass';

export default class DepthOfField extends BokehPass {

    constructor(params, renderer, scene, camera) {
        const { screen } = params;
        const { w: width, h: height, ratio: aspect } = screen;
        super(
            scene,
            camera,
            { ...params, width, height, aspect });
    }
};
