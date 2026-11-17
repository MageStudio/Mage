import Config from "../../core/config";
import { HudElement, isValidType } from "./HudElement";
import { isValidAnchor } from "./anchors";
import { HUD_CLASS, injectStyles } from "./styles";

export { HudElement };

class HudUI {
    constructor() {
        this.root = null;
        this.elements = new Map();
        this.editMode = false;
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
    }

    isEditMode() {
        return this.editMode;
    }
}

export default new HudUI();
