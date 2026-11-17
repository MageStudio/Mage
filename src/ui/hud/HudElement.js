import { applyAnchor, isValidAnchor } from "./anchors";
import { HUD_HIDDEN_CLASS } from "./styles";

export const TYPES = {
    label: "div",
    button: "button",
    input: "input",
};

const EVENTS = ["click", "change", "submit"];

export const isValidType = type => Object.prototype.hasOwnProperty.call(TYPES, type);

export class HudElement {
    constructor(definition = {}, { editMode = false } = {}) {
        const { id, name, type, text, value, placeholder, anchor, offset, visible, style } =
            definition;

        if (!isValidType(type)) {
            throw new Error(`UI element "${name}" has unknown type "${type}"`);
        }
        if (!isValidAnchor(anchor)) {
            throw new Error(`UI element "${name}" has unknown anchor "${anchor}"`);
        }

        this.id = id;
        this.name = name;
        this.type = type;
        this.editMode = editMode;
        this.visible = visible !== false;
        this.listeners = { click: new Map(), change: new Map(), submit: new Map() };

        const element = document.createElement(TYPES[type]);
        element.style.position = "absolute";
        element.style.pointerEvents = "auto";
        this.element = element;

        if (type === "input") {
            element.type = "text";
            element.value = value || "";
            element.placeholder = placeholder || "";
            element.setAttribute("aria-label", placeholder || name);
        } else {
            element.textContent = text || "";
        }

        this.setStyle(style || {});
        this.setAnchor(anchor, offset);
        this.applyVisibility();
        this.applyEditMode();
    }

    isInput() {
        return this.type === "input";
    }

    setText(text) {
        if (this.isInput()) {
            throw new Error(`UI element "${this.name}" is an input; use setValue`);
        }
        this.element.textContent = String(text);
    }

    getText() {
        if (this.isInput()) {
            throw new Error(`UI element "${this.name}" is an input; use getValue`);
        }
        return this.element.textContent;
    }

    setValue(value) {
        if (!this.isInput()) {
            throw new Error(`UI element "${this.name}" is not an input; use setText`);
        }
        this.element.value = String(value);
    }

    getValue() {
        if (!this.isInput()) {
            throw new Error(`UI element "${this.name}" is not an input; use getText`);
        }
        return this.element.value;
    }

    setStyle(map = {}) {
        Object.keys(map).forEach(property => {
            this.element.style.setProperty(property, map[property]);
        });
    }

    setAnchor(anchor, offset) {
        if (!isValidAnchor(anchor)) {
            throw new Error(`UI element "${this.name}" has unknown anchor "${anchor}"`);
        }
        this.anchor = anchor;
        this.offset = { x: offset?.x || 0, y: offset?.y || 0 };
        applyAnchor(this.element, this.anchor, this.offset);
    }

    show() {
        this.visible = true;
        this.applyVisibility();
    }

    hide() {
        this.visible = false;
        this.applyVisibility();
    }

    isVisible() {
        return this.visible;
    }

    applyVisibility() {
        const { element, visible, editMode } = this;

        if (editMode) {
            element.style.removeProperty("display");
            element.classList.toggle(HUD_HIDDEN_CLASS, !visible);
        } else {
            element.classList.remove(HUD_HIDDEN_CLASS);
            if (visible) {
                element.style.removeProperty("display");
            } else {
                element.style.setProperty("display", "none");
            }
        }
    }

    setEditMode(editMode) {
        this.editMode = Boolean(editMode);
        this.applyEditMode();
        this.applyVisibility();
    }

    applyEditMode() {
        if (this.editMode) {
            this.element.setAttribute("tabindex", "-1");
        } else {
            this.element.removeAttribute("tabindex");
        }
        if (this.isInput()) {
            this.element.readOnly = this.editMode;
        }
    }

    on(event, fn) {
        if (!EVENTS.includes(event)) {
            throw new Error(`UI element "${this.name}": unknown event "${event}"`);
        }
        if (event !== "click" && !this.isInput()) {
            throw new Error(`UI element "${this.name}": "${event}" is only available on inputs`);
        }
        if (this.listeners[event].has(fn)) {
            return;
        }

        let domEvent = "click";
        let handler = fn;

        if (event === "change") {
            domEvent = "input";
            handler = () => fn(this.element.value);
        } else if (event === "submit") {
            domEvent = "keydown";
            handler = e => {
                if (e.key === "Enter") {
                    fn(this.element.value);
                }
            };
        }

        this.listeners[event].set(fn, { domEvent, handler });
        this.element.addEventListener(domEvent, handler);
    }

    off(event, fn) {
        const entry = this.listeners[event]?.get(fn);
        if (!entry) {
            return;
        }
        this.element.removeEventListener(entry.domEvent, entry.handler);
        this.listeners[event].delete(fn);
    }

    dispose() {
        EVENTS.forEach(event => {
            Array.from(this.listeners[event].keys()).forEach(fn => this.off(event, fn));
        });
        this.element.remove();
    }
}

export default HudElement;
