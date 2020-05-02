import {
    EventDispatcher,
    Raycaster,
    Vector2,
    Mesh
} from 'three';

import Config from '../config';
import Scene from '../Scene';
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
        this.meshDeselectEvent = { type: 'meshDeselect' };
    }

    createRayCaster() {
        this.raycaster = new Raycaster();
        this.raycaster.setFromCamera(this.mouse, Scene.camera.object);
    }

    enable() {
        this.enabled = true;

        this.createRayCaster();

        Scene.renderer.domElement.addEventListener('mousemove', this.onMouseMove);
        Scene.renderer.domElement.addEventListener('mousedown', this.onMouseDown);
        document.addEventListener('mouseup', this.onMouseUp);
    }

    disable() {
        this.enabled = false;

        document.removeEventListener('mouseup', this.onMouseUp);
        Scene.renderer.domElement.removeEventListener('mousemove', this.onMouseMove);
        Scene.renderer.domElement.removeEventListener('mousedown', this.onMouseDown);
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

    getMouseEvent = (event) => {
        const { x, y } = this.getRelativeMousePosition(event);
        this.normalizeMouse(x, y);

        return {
            x, y,
            normalized: { ...this.mouse }
        }
    }

    onMouseMove = () => {
        if (!this.enabled) return;
        event.preventDefault();

        this.mouseMoveEvent.mouse = this.getMouseEvent(event);

        this.dispatchEvent(this.mouseMoveEvent);
    }

    isIntersectionAMesh = (o) => o.object instanceof Mesh;
    getMeshFromUniverse = ({ object: { name } = {} }) => Universe.get(name);
    meshExists = (m) => !!m;

    getIntersections = () => {
        this.raycaster.setFromCamera(this.mouse, Scene.camera.object);

        const intersects = this.raycaster.intersectObjects(Scene.scene.children);
        const filtered = intersects.filter(this.isIntersectionAMesh);

        return filtered
            .map(this.getMeshFromUniverse)
            .filter(this.meshExists);
    }

    onMouseDown = (event) => {
        if (!this.enabled) return;
        event.preventDefault();

        const mouseEvent = this.getMouseEvent(event);
        this.mouseDownEvent.mouse = mouseEvent;
        this.meshClickEvent.mouse = mouseEvent;

        this.dispatchEvent(this.mouseDownEvent);

        const meshes = this.getIntersections();
        this.meshClickEvent.meshes = meshes;

        if (!meshes.length) {
            this.dispatchEvent(this.meshDeselectEvent);
        } else {
            this.dispatchEvent(this.meshClickEvent);
        }
    }
}
