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
        //this.keyboard.addEventListener('keyPress', this.propagate.bind(this));
    }

    enableMouse() {

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
    }
}
