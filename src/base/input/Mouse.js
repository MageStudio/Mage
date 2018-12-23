import {
    EventDispatcher,
    Raycaster,
    Vector2,
    Mesh
} from 'three';

import Config from '../config';
import SceneManager from '../SceneManager';
import Universe from '../Universe';

export default class Mouse extends EventDispatcher {

    constructor() {
        super();

        this.enabled = false;
        this.mouse = new Vector2();

        this.mouseDownEvent = { type: 'mouseDown' };
        this.mouseUpEvent = { type: 'mouseUp' };
        this.mouseMoveEvent = { type: 'mouseMove' };
        this.meshClickEvent = { type: 'meshClick' };
    }

    createRayCaster() {
        this.raycaster = new Raycaster();
        this.raycaster.setFromCamera(this.mouse, SceneManager.camera.object);
    }

    enable() {
        this.enabled = true;

        this.createRayCaster();

        SceneManager.renderer.domElement.addEventListener('mousemove', this.onMouseMove);
        SceneManager.renderer.domElement.addEventListener('mousedown', this.onMouseDown);
        document.addEventListener('mouseup', this.onMouseUp);
    }

    disable() {
        this.enabled = false;

        document.removeEventListener('mouseup', this.onMouseUp);
        SceneManager.renderer.domElement.removeEventListener('mousemove', this.onMouseMove);
        SceneManager.renderer.domElement.removeEventListener('mousedown', this.onMouseDown);
    }

    getRelativeMousePosition(event) {
        const rect = Config.container().getBoundingClientRect();

        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        return { x, y };
    }

    normalizeMouse(x, y) {
        const { w, h } = Config.screen();

        this.mouse.x = (x / w) * 2 - 1;
		this.mouse.y = - (y / h) * 2 + 1;
    }

    onMouseMove = () => {
        if (!this.enabled) return;

        event.preventDefault();

        const { x, y } = this.getRelativeMousePosition(event);

        this.normalizeMouse(x, y);
        this.mouseMoveEvent.mouse = {
            position: { x, y },
            normalized: { x: this.mouse.x, y: this.mouse.y }
        };
        this.dispatchEvent(this.mouseMoveEvent);
    }

    onMouseDown = (event) => {
        if (!this.enabled) return;

        event.preventDefault();

        const { x, y } = this.getRelativeMousePosition(event);
        this.normalizeMouse(x, y);
        this.mouseDownEvent.mouse = {
            position: { x, y },
            normalized: { x: this.mouse.x, y: this.mouse.y }
        };
        this.dispatchEvent(this.mouseDownEvent);

        this.raycaster.setFromCamera(this.mouse, SceneManager.camera.object);
        const intersects = this.raycaster.intersectObjects(SceneManager.scene.children);

        const filtered = intersects.filter(o => o.object instanceof Mesh);
        const meshes = filtered.map(o => Universe.get(o.object.uuid)).filter(o => !!o);

        this.meshClickEvent.mouse = {
            position: { x, y },
            normalized: { x: this.mouse.x, y: this.mouse.y }
        };
        this.meshClickEvent.meshes = meshes;
        if (!meshes.length) return;

        this.dispatchEvent(this.meshClickEvent);
    }
}
