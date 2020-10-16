import {
    EventDispatcher,
    Raycaster,
    Vector2,
    Mesh
} from 'three';

import Config from '../config';
import Scene from '../Scene';
import Universe from '../Universe';

export const MOUSE_DOWN = 'mouseDown';
export const MOUSE_UP = 'mouseUp';
export const MOUSE_MOVE = 'mouseMove';
export const ELEMENT_CLICK = 'elementClick';
export const ELEMENT_DESELECT = 'elementDeselect';

export default class Mouse extends EventDispatcher {

    constructor() {
        super();

        this.enabled = false;
        this.mouseMoveIntersectionEnabled = false;
        this.mouse = new Vector2();

        this.mouseDownEvent = { type: MOUSE_DOWN };
        this.mouseUpEvent = { type: MOUSE_UP };
        this.mouseMoveEvent = { type: MOUSE_MOVE };
        this.elementClickEvent = { type: ELEMENT_CLICK };
        this.elementDeselectEvent = { type: ELEMENT_DESELECT };
    }

    hasRaycaster() {
        return Boolean(this.raycaster);
    }

    createRayCaster() {
        if (!this.hasRaycaster()) {
            this.raycaster = new Raycaster();
            this.raycaster.setFromCamera(this.mouse, Scene.getCameraBody());
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
        element: Universe.get(name)
    });

    elementExists = ({ element }) => !!element;

    getIntersections = () => {
        if (this.hasRaycaster()) {
            this.raycaster.setFromCamera(this.mouse, Scene.getCameraBody());

            return this.raycaster
                .intersectObjects(Scene.getChildren())
                .filter(this.isIntersectionAMeshOrSprite)
                .map(this.getMeshFromUniverse)
                .filter(this.elementExists);
        }
    }

    onMouseDown = (event) => {
        if (!this.enabled) return;
        event.preventDefault();

        const mouseEvent = this.parseMouseEvent(event);
        this.mouseDownEvent.mouse = mouseEvent;
        this.elementClickEvent.mouse = mouseEvent;

        this.dispatchEvent(this.mouseDownEvent);

        const elements = this.getIntersections();
        this.elementClickEvent.elementes = elements;

        if (!elements.length) {
            this.dispatchEvent(this.elementDeselectEvent);
        } else {
            this.dispatchEvent(this.elementClickEvent);
        }
    }
}
