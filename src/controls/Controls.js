import Scene from '../core/Scene';
import Orbit from './Orbit';
import Transform from './Transform';
import FirstPersonControl from './FirstPersonControl';
import FlyControl from './FlyControl';

const CONTROLS = {
    ORBIT: 'orbit',
    TRANSFORM: 'transform',
    FPS: 'fps',
    FLY: 'fly'
};

const AVAILABLE_CONTROLS = Object.keys(CONTROLS);

const EVENTS = {
    CHANGE: 'change',
    DRAGGING_CHANGE: 'dragging-changed'
};

export class Controls {

    constructor() {

        this.controls = {
            [CONTROLS.ORBIT]: undefined,
            [CONTROLS.TRANSFORM]: undefined,
            [CONTROLS.FPS]: undefined,
            [CONTROLS.FLY]: undefined
        };
    }

    disposePreviousControls(controls = []) {
        controls.forEach(this.disposeSingleControls.bind(this));
    }

    disposeSingleControls = control => {
        if (this.controls[control] && this.controls[control].dispose) {
            this.controls[control].dispose();
            delete this.controls[control];
        }
    }

    dispose() {
        AVAILABLE_CONTROLS.forEach(this.disposeSingleControls.bind(this));
    }

    getControl(control) {
        if (control && this.controls[control]) {
            return this.controls[control];
        }
    }

    onPhysicsUpdate(dt) {
        Object
            .keys(this.controls)
            .forEach(control => {
                this.controls[control] && this.controls[control].physicsUpdate(dt);
            });
    }

    update(dt) {
        Object
            .keys(this.controls)
            .forEach(control => {
                this.controls[control] && this.controls[control].update(dt);
            });
    }

    setOrbitControl() {
        this.disposePreviousControls([CONTROLS.FPS, CONTROLS.FLY]);
        this.controls[CONTROLS.ORBIT] = new Orbit(Scene.getCameraBody(), Scene.getDOMElement());
        this.controls[CONTROLS.ORBIT].init();

        this.controls[CONTROLS.ORBIT].addEventListener(EVENTS.CHANGE, Scene.render);

        return this.controls[CONTROLS.ORBIT];
    }

    setTransformControl() {
        this.controls[CONTROLS.TRANSFORM] = new Transform(Scene.getCameraBody(), Scene.getDOMElement());
        this.controls[CONTROLS.TRANSFORM].init();
        this.controls[CONTROLS.TRANSFORM].addEventListener(EVENTS.CHANGE, Scene.render);
        this.controls[CONTROLS.TRANSFORM].addEventListener(EVENTS.DRAGGING_CHANGE, (event) => {
            if (this.controls[CONTROLS.ORBIT]) {
                this.controls[CONTROLS.ORBIT].enabled = !event.value;
            }
        });

        return this.controls.transform;
    }

    setFirstPersonControl(options) {
        this.controls[CONTROLS.FPS] = new FirstPersonControl(Scene.getCamera(), Scene.getDOMElement(), options);
        this.controls[CONTROLS.FPS].init();

        return this.controls[CONTROLS.FPS];
    }

    setFlyControl() {
        this.controls[CONTROLS.FLY] = new FlyControl(Scene.getCameraBody(), Scene.getDOMElement());
        this.controls[CONTROLS.FLY].init();

        return this.controls[CONTROLS.FLY];
    }
}

export default new Controls();
