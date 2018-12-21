import SceneManager from '../base/SceneManager';
import Orbit from './Orbit';
import Transform from './Transform';

export class ControlsManager {

    constructor() {

        this.controls = {
            orbit: undefined,
            transform: undefined
        };
    }

    disposePreviousControls(controls = []) {
        controls.forEach(c => {
            if (this.controls[c] && this.controls[c].dispose) {
                this.controls[c].dispose();
                delete this.controls[c];
            }
        })
    }

    getControl(control) {
        if (control && this.controls[control]) {
            return this.controls[control];
        }
    }

    setOrbitControl() {
        this.disposePreviousControls(['pointerlock', 'fly']);
        this.controls.orbit = new Orbit(SceneManager.camera.object, SceneManager.renderer.domElement);
        this.controls.orbit.init();

        this.controls.orbit.addEventListener('change', SceneManager.render);
    }

    setTransformControl() {
        this.controls.transform = new Transform(SceneManager.camera.object, SceneManager.renderer.domElement);
        this.controls.transform.init();
		this.controls.transform.addEventListener('change', SceneManager.render);
		this.controls.transform.addEventListener('dragging-changed', (event) => {
            if (this.controls.orbit) {
                this.controls.orbit.enabled = !event.value;
            }
		});
    }
}

export default new ControlsManager();
