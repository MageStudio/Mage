import {
    EventDispatcher
} from 'three';

import Keyboard from './Keyboard';
import Mouse from './Mouse';

export class Input extends EventDispatcher {

    constructor() {
        super();
        this.enabled = false;
    }

    enable() {
        if (!this.enabled) {
            this.mouse = new Mouse();
            this.keyboard = new Keyboard();
            this.enableKeyboard();
            this.enableMouse();
            this.enabled = true;
        }
    }

    disable() {
        if (this.enabled) {
            this.disableKeyboard();
            this.disableMouse();
            this.enabled = false;
        }
    }

    enableKeyboard() {
        this.keyboard.enable(this.handleKeyBoardEvent.bind(this));
    }

    enableMouse() {
        this.mouse.enable();

        this.mouse.addEventListener('mouseDown', this.propagate.bind(this));
        this.mouse.addEventListener('mouseUp', this.propagate.bind(this));
        this.mouse.addEventListener('mouseMove', this.propagate.bind(this));
        this.mouse.addEventListener('meshClick', this.propagate.bind(this));
        this.mouse.addEventListener('meshDeselect', this.propagate.bind(this));
    }

    propagate = (event) => {
        this.dispatchEvent(event);
    }

    handleKeyBoardEvent = (event, handler) => {
        if (event.type === Keyboard.KEYDOWN) {
            this.dispatchEvent({
                type: 'keyDown',
                event
            });
        }

        if (event.type === Keyboard.KEYUP) {
            this.dispatchEvent({
                type: 'keyUp',
                event
            });
        }

        this.dispatchEvent({
            type: 'keyPress',
            event
        });
    }

    disableKeyboard() {
        this.keyboard.disable();
        this.keyboard = undefined;
    }

    disableMouse() {
        this.mouse.disable();

        this.mouse.removeEventListener('mouseDown', this.propagate.bind(this));
        this.mouse.removeEventListener('mouseUp', this.propagate.bind(this));
        this.mouse.removeEventListener('mouseMove', this.propagate.bind(this));
        this.mouse.removeEventListener('meshClick', this.propagate.bind(this));

        this.mouse = undefined;
    }
}

export default new Input();
