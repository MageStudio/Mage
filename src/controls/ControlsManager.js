import SceneManager from '../base/SceneManager';
import Orbit from './Orbit';

export class ControlsManager {

    constructor() {
        this.control = null;
    }

    disposePreviousControl() {
        if (this.control && this.control.dispose) {
            this.control.dispose();
        }
    }

    setOrbitControl() {
        this.disposePreviousControl();

        this.control = new Orbit(SceneManager.camera.object, SceneManager.renderer.domElement);
        this.control.init();

        this.control.addEventListener('change', SceneManager.render);
    }
}

export default new ControlsManager();
