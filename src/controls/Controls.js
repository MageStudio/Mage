import Scene from "../core/Scene";
import Orbit from "./Orbit";
import Transform from "./Transform";
import FirstPersonControl from "./FirstPersonControl";
import FlyControl from "./FlyControl";
import { EventDispatcher, Vector3 } from "three";
import { DEPRECATIONS } from "../lib/messages";
import { AVAILABLE_CONTROLS, CONTROLS } from "./constants";
import Universe from "../core/Universe";

export const THREEJS_CONTROL_EVENTS = {
    CHANGE: "change",
    OBJECT_CHANGE: "objectChange",
    DRAGGING_CHANGE: "dragging-changed",
};

export const CONTROL_EVENTS = {
    TRANSFORM: {
        CHANGE: `${CONTROLS.TRANSFORM}:CHANGE`,
        DRAGGING_CHANGE: `${CONTROLS.TRANSFORM}:DRAGGING_CHANGE`,
    },
};

export class Controls extends EventDispatcher {
    constructor() {
        super();
        this.controls = {
            [CONTROLS.ORBIT]: undefined,
            [CONTROLS.TRANSFORM]: undefined,
            [CONTROLS.FPS]: undefined,
            [CONTROLS.FLY]: undefined,
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
    };

    dispose() {
        AVAILABLE_CONTROLS.forEach(this.disposeSingleControls.bind(this));
    }

    getControl(control) {
        if (control && this.controls[control]) {
            return this.controls[control];
        }
    }

    onPhysicsUpdate(dt) {
        Object.keys(this.controls).forEach(control => {
            this.controls[control] && this.controls[control].physicsUpdate(dt);
        });
    }

    update(dt) {
        Object.keys(this.controls).forEach(control => {
            this.controls[control] && this.controls[control].update(dt);
        });
    }

    setOrbitControl(options) {
        console.warn(DEPRECATIONS.SET_ORBIT_CONTROL);
        return this.setOrbitControls(options);
    }

    setOrbitControls({ target = new Vector3() } = {}) {
        this.disposePreviousControls([CONTROLS.FPS, CONTROLS.FLY]);
        this.controls[CONTROLS.ORBIT] = new Orbit(Scene.getCameraBody(), Scene.getDOMElement());
        this.controls[CONTROLS.ORBIT].init();
        this.controls[CONTROLS.ORBIT].setTarget(target);

        return this.controls[CONTROLS.ORBIT];
    }

    setTransformControl(options) {
        console.warn(DEPRECATIONS.SET_TRANSFORM_CONTROL);
        return this.setTransformControls(options);
    }

    setTransformControls() {
        const control = new Transform(Scene.getCameraBody(), Scene.getDOMElement());
        control.init();
        control.addEventListener(THREEJS_CONTROL_EVENTS.CHANGE, () => {
            this.dispatchEvent({
                type: CONTROL_EVENTS.TRANSFORM.CHANGE,
                element: Universe.find(control.object),
            });
            Scene.render.call(Scene);
        });
        control.addEventListener(THREEJS_CONTROL_EVENTS.OBJECT_CHANGE, () => {
            this.dispatchEvent({
                type: CONTROL_EVENTS.TRANSFORM.CHANGE,
                element: Universe.find(control.object),
            });
            Scene.render.call(Scene);
        });
        control.addEventListener(THREEJS_CONTROL_EVENTS.DRAGGING_CHANGE, event => {
            this.dispatchEvent({
                type: CONTROL_EVENTS.TRANSFORM.DRAGGING_CHANGE,
                element: Universe.find(control.object),
            });
            if (this.controls[CONTROLS.ORBIT]) {
                this.controls[CONTROLS.ORBIT].enabled = !event.value;
            }
        });

        this.controls[CONTROLS.TRANSFORM] = control;

        return this.controls[CONTROLS.TRANSFORM];
    }

    setFirstPersonControl(options) {
        console.warn(DEPRECATIONS.SET_FIRST_PERSON_CONTROL);
        return this.setFirstPersonControls(options);
    }

    setFirstPersonControls(options) {
        this.controls[CONTROLS.FPS] = new FirstPersonControl(
            Scene.getCamera(),
            Scene.getDOMElement(),
            options,
        );
        this.controls[CONTROLS.FPS].init();

        return this.controls[CONTROLS.FPS];
    }

    setFlyControl(options) {
        console.warn(DEPRECATIONS.SET_FLY_CONTROL);
        return this.setFlyControls(options);
    }

    setFlyControls() {
        this.controls[CONTROLS.FLY] = new FlyControl(Scene.getCameraBody(), Scene.getDOMElement());
        this.controls[CONTROLS.FLY].init();

        return this.controls[CONTROLS.FLY];
    }
}

export default new Controls();
