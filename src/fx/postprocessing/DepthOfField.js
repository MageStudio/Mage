import SceneManager from '../../base/SceneManager';
import config from '../../base/config';

import BokehPass from './BokehPass';

export default class DepthOfField extends BokehPass {

    constructor(params) {
        const { w: width, h: height } = config.screen();
        super(
            SceneManager.scene,
            SceneManager.camera.object,
            { ...params, width, height });
    }
};
