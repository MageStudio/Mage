import Config from "../../core/config";
import { HudElement, isValidType } from "./HudElement";
import { isValidAnchor } from "./anchors";
import { HUD_CLASS, injectStyles } from "./styles";
import { LabelHandle, LABELS_CLASS, updateLabel, getContainerSize } from "./labels";

export { HudElement };

class HudUI {
    constructor() {
        this.root = null;
        this.elements = new Map();
        this.editMode = false;
        this.labels = new Map();
        this.labelsLayer = null;
    }

    getLabelsLayer() {
        if (!this.labelsLayer) {
            const layer = document.createElement("div");
            layer.className = LABELS_CLASS;
            layer.style.position = "absolute";
            layer.style.top = "0";
            layer.style.right = "0";
            layer.style.bottom = "0";
            layer.style.left = "0";
            layer.style.pointerEvents = "none";
            // Own stacking context: label z-indexes stay inside it, below every HUD widget.
            layer.style.zIndex = "0";
            this.labelsLayer = layer;
        }

        return this.labelsLayer;
    }

    // Created lazily so importing the engine never touches `document`.
    getRoot() {
        const container = Config.container();

        if (!this.root || this.root.parentNode !== container) {
            injectStyles();

            if (this.root) {
                this.root.remove();
            }

            // jsdom reports "" for an unpositioned element, browsers "static".
            const position = window.getComputedStyle(container).position;
            if (!position || position === "static") {
                container.style.position = "relative";
            }

            const root = document.createElement("div");
            root.className = HUD_CLASS;
            root.style.position = "absolute";
            root.style.inset = "0";
            root.style.top = "0";
            root.style.right = "0";
            root.style.bottom = "0";
            root.style.left = "0";
            root.style.pointerEvents = "none";
            // The labels layer goes first so every HUD widget draws above labels.
            root.appendChild(this.getLabelsLayer());
            container.appendChild(root);

            this.root = root;
            this.elements.forEach(handle => root.appendChild(handle.element));
        }

        return this.root;
    }

    loadHUD(hud) {
        this.clear();

        const elements = (hud && hud.elements) || [];
        elements.forEach(definition => this.create(definition));
    }

    create(definition = {}) {
        const { name, type, anchor } = definition;

        if (this.elements.has(name)) {
            throw new Error(`UI element "${name}" already exists`);
        }
        if (!isValidType(type)) {
            throw new Error(`UI element "${name}" has unknown type "${type}"`);
        }
        if (!isValidAnchor(anchor)) {
            throw new Error(`UI element "${name}" has unknown anchor "${anchor}"`);
        }

        const handle = new HudElement(definition, { editMode: this.editMode });
        this.getRoot().appendChild(handle.element);
        this.elements.set(name, handle);

        return handle;
    }

    get(name) {
        const handle = this.elements.get(name);

        if (!handle) {
            throw new Error(`UI element "${name}" not found`);
        }

        return handle;
    }

    has(name) {
        return this.elements.has(name);
    }

    getAll() {
        return Array.from(this.elements.values());
    }

    remove(name) {
        this.get(name).dispose();
        this.elements.delete(name);
    }

    clear() {
        this.elements.forEach(handle => handle.dispose());
        this.elements.clear();
    }

    setEditMode(editMode) {
        this.editMode = Boolean(editMode);
        this.elements.forEach(handle => handle.setEditMode(this.editMode));
        this.labels.forEach(handle => handle.setEditMode(this.editMode));
    }

    setLabel(entity, definition = {}) {
        this.removeLabel(entity, { silent: true });

        const handle = new LabelHandle(entity, definition, { editMode: this.editMode });
        this.getRoot();
        this.getLabelsLayer().appendChild(handle.element);
        this.labels.set(entity, handle);

        return handle;
    }

    hasLabel(entity) {
        return this.labels.has(entity);
    }

    getLabel(entity) {
        const handle = this.labels.get(entity);

        if (!handle) {
            throw new Error(`Entity "${entity.getName()}" has no label`);
        }

        return handle;
    }

    removeLabel(entity, { silent = false } = {}) {
        const handle = silent ? this.labels.get(entity) : this.getLabel(entity);

        if (handle) {
            handle.dispose();
            this.labels.delete(entity);
        }
    }

    updateLabels(camera) {
        if (!camera || this.labels.size === 0) {
            return;
        }

        // The camera may have moved since the renderer last refreshed its matrices.
        camera.updateMatrixWorld();

        const { width, height } = getContainerSize();
        const options = { width, height, editMode: this.editMode };

        this.labels.forEach(handle => updateLabel(handle, camera, options));
    }

    isEditMode() {
        return this.editMode;
    }
}

export default new HudUI();
