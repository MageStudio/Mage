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
        this.mouseMoveIntersectionEnabled = false;
        this.mouse = new Vector2();

        this.mouseDownEvent = { type: 'mouseDown' };
        this.mouseUpEvent = { type: 'mouseUp' };
        this.mouseMoveEvent = { type: 'mouseMove' };
        this.meshClickEvent = { type: 'meshClick' };
        this.meshDeselectEvent = { type: 'meshDeselect' };
    }

    hasRaycaster() {
        return Boolean(this.raycaster);
    }

    createRayCaster() {
        if (!this.hasRaycaster()) {
            this.raycaster = new Raycaster();
            this.raycaster.setFromCamera(this.mouse, Scene.getCameraObject());
        }   
    }

    enable() {
        this.enabled = true;

        this.createRayCaster();

        Scene.renderer.domElement.addEventListener('mousemove', this.onMouseMove);
        Scene.renderer.domElement.addEventListener('mousedown', this.onMouseDown);
        document.addEventListener('mouseup', this.onMouseUp);
    }

    enableMouseMoveIntersection() {
        this.mouseMoveIntersectionEnabled = true;
    }

    disable() {
        this.enabled = false;
        this.mouseMoveIntersectionEnabled = false;

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

    parseMouseEvent = (event) => {
        const { x, y } = this.getRelativeMousePosition(event);
        this.normalizeMouse(x, y);

        return {
            x, y,
            normalized: { ...this.mouse }
        }
    }

    onMouseMove = event => {
        if (!this.enabled) return;
        event.preventDefault();

        this.mouseMoveEvent.mouse = this.parseMouseEvent(event);

        this.dispatchEvent(this.mouseMoveEvent);
    }

    onMouseUp = event => {
        if (!this.enabled) return;
        event.preventDefault();

        this.mouseUpEvent.mouse = this.parseMouseEvent(event);

        this.dispatchEvent(this.mouseUpEvent);
    }

    isIntersectionAMeshOrSprite = (o) => !!o.object.isMesh || !!o.object.isSprite;
    getMeshFromUniverse = ({ object: { name } = {}, face, point }) => ({
        face,
        position: point,
        name,
        mesh: Universe.get(name)
    });
    meshExists = ({ mesh }) => !!mesh;

    getIntersections = () => {
        if (this.hasRaycaster()) {
            this.raycaster.setFromCamera(this.mouse, Scene.getCameraObject());

            return this.raycaster
                .intersectObjects(Scene.getChildren())
                .filter(this.isIntersectionAMeshOrSprite)
                .map(this.getMeshFromUniverse)
                .filter(this.meshExists);
        }
    }

    onMouseDown = (event) => {
        if (!this.enabled) return;
        event.preventDefault();

        const mouseEvent = this.parseMouseEvent(event);
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
