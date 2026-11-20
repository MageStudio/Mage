import { Vector3 } from "three";
import Config from "../../core/config";
import { HudElement } from "./HudElement";

export const LABELS_CLASS = "mage-labels";
export const LABEL_CLASS = "mage-label";

const Z_BASE = 1000000;
const Z_PER_UNIT = 100;

const toNumber = value => Number(value) || 0;

const normalizeOffset = offset => ({
    x: toNumber(offset?.x),
    y: toNumber(offset?.y),
    z: toNumber(offset?.z),
});

/**
 * The handle of an entity's label. Same shape as a HUD widget handle with `type: "label"`, but
 * its position comes from its entity, so it isn't registered in `UI` and takes no anchor or click.
 */
export class LabelHandle extends HudElement {
    constructor(entity, definition = {}, { editMode = false } = {}) {
        const { text, offset, maxDistance, visible, style } = definition;

        super(
            {
                name: entity.getName(),
                type: "label",
                text,
                anchor: "top-left",
                visible,
                style,
            },
            { editMode },
        );

        this.entity = entity;
        this.offset3 = normalizeOffset(offset);
        this.maxDistance = Math.max(0, toNumber(maxDistance));
        this.frameHidden = true;

        const { element } = this;
        element.classList.add(LABEL_CLASS);
        element.style.pointerEvents = "none";
        element.style.removeProperty("right");
        element.style.removeProperty("bottom");
        element.style.setProperty("left", "0");
        element.style.setProperty("top", "0");
        element.style.removeProperty("transform");
        this.applyVisibility();
    }

    setStyle(map = {}) {
        this.styleMap = Object.assign(this.styleMap || {}, map);
        super.setStyle(map);
    }

    setAnchor(anchor, offset) {
        // HudElement's constructor calls this once before `entity` is set.
        if (this.entity) {
            throw new Error(`Label "${this.name}" takes its position from its entity`);
        }
        super.setAnchor(anchor, offset);
    }

    on(event, fn) {
        if (event === "click") {
            throw new Error("Labels don't take clicks");
        }
        super.on(event, fn);
    }

    applyVisibility() {
        const { element, visible, editMode, frameHidden } = this;

        element.classList.toggle("mage-hud-hidden", Boolean(editMode && !visible));

        if (frameHidden || (!editMode && !visible)) {
            element.style.setProperty("display", "none");
        } else {
            element.style.removeProperty("display");
        }
    }

    setFrameHidden(hidden) {
        if (this.frameHidden !== hidden) {
            this.frameHidden = hidden;
            this.applyVisibility();
        }
    }

    toDefinition() {
        const { x, y, z } = this.offset3;

        return {
            text: this.getText(),
            offset: { x, y, z },
            maxDistance: this.maxDistance,
            visible: this.visible,
            style: { ...this.styleMap },
        };
    }
}

const isEntityVisible = entity => {
    let node = entity.getBody();

    while (node) {
        if (node.visible === false) {
            return false;
        }
        node = node.parent;
    }

    return true;
};

const point = new Vector3();
const ndc = new Vector3();
const cameraPosition = new Vector3();

/**
 * Moves every label to its entity's projected screen position. Called once per frame after the
 * camera has updated.
 */
export const updateLabel = (handle, camera, { width, height, editMode }) => {
    const { entity, offset3, maxDistance } = handle;

    if (!entity.hasBody() || !isEntityVisible(entity)) {
        handle.setFrameHidden(true);
        return;
    }

    entity.getBody().getWorldPosition(point);
    point.x += offset3.x;
    point.y += offset3.y;
    point.z += offset3.z;

    ndc.copy(point).project(camera);
    camera.getWorldPosition(cameraPosition);
    const distance = cameraPosition.distanceTo(point);

    // Camera space looks down -z, so z > 0 means behind the camera.
    const behind = point.clone().applyMatrix4(camera.matrixWorldInverse).z > 0;
    const outside = behind || !Number.isFinite(ndc.z) || Math.abs(ndc.z) > 1;
    const tooFar = !editMode && maxDistance > 0 && distance > maxDistance;

    if (outside || tooFar) {
        handle.setFrameHidden(true);
        return;
    }

    const x = ((ndc.x + 1) / 2) * width;
    const y = ((1 - ndc.y) / 2) * height;
    const { style } = handle.element;

    style.setProperty("transform", `translate(${x}px, ${y}px) translate(-50%, -100%)`);
    style.setProperty("z-index", String(Math.max(0, Z_BASE - Math.round(distance * Z_PER_UNIT))));
    handle.setFrameHidden(false);
};

export const getContainerSize = () => {
    const container = Config.container();

    return { width: container.offsetWidth, height: container.offsetHeight };
};
