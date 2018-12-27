import {
    EventDispatcher
} from 'three';

import Keyboard from './Keyboard';
import Mouse from './Mouse';

export default class Input extends EventDispatcher {

    constructor() {
        super();
        this.mouse = new Mouse();
        this.keyboard = new Keyboard();
    }

    enable() {
        this.enableKeyboard();
        this.enableMouse();
    }

    disable() {
        this.disableKeyboard();
        this.disableMouse();
    }

    enableKeyboard() {
        this.keyboard.enable(this.handleKeyBoardEvent);
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

    handleKeyBoardEvent = (event) => {
        console.log('inside handlekeyboard event');
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
        this.mouse = undefined;

        this.mouse.removeEventListener('mouseDown', this.propagate.bind(this));
        this.mouse.removeEventListener('mouseUp', this.propagate.bind(this));
        this.mouse.removeEventListener('mouseMove', this.propagate.bind(this));
        this.mouse.removeEventListener('meshClick', this.propagate.bind(this));
    }
}
