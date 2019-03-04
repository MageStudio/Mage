import {
    App,
    ControlsManager,
    SceneManager
} from 'mage-engine';

export default class FirstScene extends App {

    constructor(config, container) {
        super(config, container);
    }

    onCreate() {
        ControlsManager.setOrbitControl();
        const cube = this.sceneHelper.addCube(20, 0xffffff);
        this.sceneHelper.addCube(40, 0x00ffff);

        SceneManager.camera.position({y: 70, z: 150});
        SceneManager.camera.lookAt(0, 0, 0);

        cube.position({y: 40});
    }
}
