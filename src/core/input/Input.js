import {
    EventDispatcher
} from 'three';

import Keyboard from './Keyboard';
import Mouse from './Mouse';
import Gamepad, {
    GAMEPAD_DISCONNECTED_EVENT,
    GAMEPAD_CONNECTED_EVENT,
    BUTTON_PRESSED_EVENT,
    BUTTON_RELEASED_EVENT,
    AXIS_CHANGE_EVENT
} from './Gamepad';

import { dispatch } from '../../store/Store';
import {
    inputEnabled,
    inputDisabled,
    gamepadEnabled,
    keyboardEnabled,
    mouseEnabled,
    keyboardDisabled,
    mouseDisabled,
    gamepadDisabled
} from '../../store/actions/input';

export const EVENTS = [
    'keyPress',
    'keyDown',
    'keyUp',
    'mouseDown',
    'mouseUp',
    'mouseMove',
    'meshClick',
    'meshDeselect',
    GAMEPAD_CONNECTED_EVENT,
    GAMEPAD_DISCONNECTED_EVENT,
    BUTTON_PRESSED_EVENT,
    BUTTON_RELEASED_EVENT,
    AXIS_CHANGE_EVENT
];

export class Input extends EventDispatcher {

    constructor() {
        super();
        this.enabled = false;
    }

    enable() {
        if (!this.enabled) {
            dispatch(inputEnabled());
            this.mouse = new Mouse();
            this.keyboard = new Keyboard();
            this.gamepad = new Gamepad();
            this.enableGamepad();
            this.enableKeyboard();
            this.enableMouse();
            this.enabled = true;
        }
    }

    disable() {
        if (this.enabled) {
            dispatch(inputDisabled());
            this.disableKeyboard();
            this.disableMouse();
            this.disableGamepad();
            this.enabled = false;
        }
    }

    enableGamepad() {
        dispatch(gamepadEnabled());
        
        this.gamepad.enable();
        this.gamepad.addEventListener(GAMEPAD_CONNECTED_EVENT, this.propagate.bind(this));
        this.gamepad.addEventListener(GAMEPAD_DISCONNECTED_EVENT, this.propagate.bind(this));
        this.gamepad.addEventListener(BUTTON_RELEASED_EVENT, this.propagate.bind(this));
        this.gamepad.addEventListener(BUTTON_PRESSED_EVENT, this.propagate.bind(this));
        this.gamepad.addEventListener(BUTTON_RELEASED_EVENT, this.propagate.bind(this));
        this.gamepad.addEventListener(AXIS_CHANGE_EVENT, this.propagate.bind(this));
    }

    enableKeyboard() {
        dispatch(keyboardEnabled());
        this.keyboard.enable(this.handleKeyBoardEvent.bind(this));
    }

    enableMouse() {
        dispatch(mouseEnabled());

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
                event: {
                    ...event,
                    ...handler
                }
            });
        }

        if (event.type === Keyboard.KEYUP) {
            this.dispatchEvent({
                type: 'keyUp',
                event: {
                    ...event,
                    ...handler
                }
            });
        }

        this.dispatchEvent({
            type: 'keyPress',
            event: {
                ...event,
                ...handler
            }
        });
    }

    disableKeyboard() {
        dispatch(keyboardDisabled());

        this.keyboard.disable();
        this.keyboard = undefined;
    }

    disableMouse() {
        dispatch(mouseDisabled());

        this.mouse.disable();
        this.mouse.removeEventListener('mouseDown', this.propagate.bind(this));
        this.mouse.removeEventListener('mouseUp', this.propagate.bind(this));
        this.mouse.removeEventListener('mouseMove', this.propagate.bind(this));
        this.mouse.removeEventListener('meshClick', this.propagate.bind(this));

        this.mouse = undefined;
    }

    disableGamepad() {
        dispatch(gamepadDisabled());

        this.gamepad.disable();
        this.gamepad.removeEventListener(GAMEPAD_CONNECTED_EVENT, this.propagate.bind(this));
        this.gamepad.removeEventListener(GAMEPAD_DISCONNECTED_EVENT, this.propagate.bind(this));
        this.gamepad.removeEventListener(BUTTON_PRESSED_EVENT, this.propagate.bind(this));
        this.gamepad.removeEventListener(BUTTON_RELEASED_EVENT, this.propagate.bind(this));
        this.gamepad.removeEventListener(AXIS_CHANGE_EVENT, this.propagate.bind(this));

        this.gamepad = null;
    }

    update() {
        if (this.gamepad.isEnabled()) {
            this.gamepad.update();
        }
    }
}

export default new Input();
