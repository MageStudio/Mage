import { EventDispatcher } from "three";
import Features, { FEATURES } from '../../lib/features';
import { gamepadDisconnected, gamepadConnected } from "../../store/actions/input";
import { dispatch } from '../../store/Store';
import { GAMEPAD_BUTTON_MAPPINGS, STANDARD } from "./constants";

const WINDOW_GAMEPAD_CONNECTED_EVENT = 'gamepadconnected';
const WINDOW_GAMEPAD_DISCONNECTED_EVENT = 'gamepaddisconnected';

export const GAMEPAD_CONNECTED_EVENT = 'gamepadConnected';
export const GAMEPAD_DISCONNECTED_EVENT = 'gamepadDisconnected';

export const X_AXES_CHANGE_EVENT = 'xAxesChange';
export const Y_AXES_CHANGE_EVENT = 'yAxesChcange';
export const AXIS_CHANGE_EVENT = 'axisChange';

export const BUTTON_PRESSED_EVENT = 'gamepadButtonPressed';
export const BUTTON_RELEASED_EVENT = 'gamepadButtonReleased';

export const isValidGamepad = gamepad => !!gamepad;

export const getConnectedGamepads = () => {
    const list = navigator.getGamepads ?
        navigator.getGamepads() :
        (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : [])

    if (typeof list === 'array') return list;

    let gamepads = [];
    for (let gamepad of navigator.getGamepads()) {
        if (isValidGamepad(gamepad)) {
            gamepads.push(gamepad);
        }
    }

    return gamepads;
};

export const mapButtonIndexToKey = (gamepad, index) => (
    (GAMEPAD_BUTTON_MAPPINGS[gamepad.id] || GAMEPAD_BUTTON_MAPPINGS[STANDARD])[index]
);

export const parseButton = (button, index)=> {

    if (typeof button === 'number') {
        return {
            pressed: button === 1.0,
            value: button,
            index,
            key: mapButtonIndexToKey(index)
        }
    };

    return {
        pressed: button.pressed,
        value: button.value,
        index,
        key: mapButtonIndexToKey(index)
    }
}

export default class Gamepad extends EventDispatcher {

    constructor() {
        super();
        this.enabled = false;
        this.gamepads = {};
    }

    reset() {
        this.enabled = false;
        this.gamepads = {};
    }

    isEnabled() {
        return this.enabled;
    }

    enable() {
        if (Features.isFeatureSupported(FEATURES.GAMEPADAPI)) {
            this.enabled = true;
            window.addEventListener(WINDOW_GAMEPAD_CONNECTED_EVENT, this.onGamepadConnected);
            window.addEventListener(WINDOW_GAMEPAD_DISCONNECTED_EVENT, this.onGamepadDisconnected);
        }
    }

    disable() {
        this.reset();
        window.removeEventListener(WINDOW_GAMEPAD_CONNECTED_EVENT, this.onGamepadConnected);
        window.removeEventListener(WINDOW_GAMEPAD_DISCONNECTED_EVENT, this.onGamepadDisconnected);
    }

    transformGamepdasForEvent = () => (
        Object
            .keys(this.gamepads)
            .reduce((acc, index) => {
                const gamepad = this.gamepads[index];

                acc[index] = {
                    index: gamepad.index,
                    connected: gamepad.connected,
                    timestamp: gamepad.timestamp,
                    id: gamepad.id,
                    mapping: gamepad.mapping
                }
                
                return acc;
            }, {})
    )

    onGamepadConnected = (e) => {
        this.addGamepad(e.gamepad);
        this.dispatchEvent({
            type: GAMEPAD_CONNECTED_EVENT,
            gamepad: e.gamepad
        });
        dispatch(gamepadConnected(this.transformGamepdasForEvent()));
    }
    onGamepadDisconnected = (e) => {
        this.removeGamepad(e.gamepad);
        this.dispatchEvent({
            type: GAMEPAD_DISCONNECTED_EVENT,
            gamepad: e.gamepad
        });
        dispatch(gamepadDisconnected(this.transformGamepdasForEvent()));
    }

    addGamepad(gamepad) { this.gamepads[gamepad.index] = gamepad; }
    removeGamepad(gamepad) { delete this.gamepads[gamepad.index]; }
    updateGamepadWithIndex(index, gamepad) { this.gamepads[index] = gamepad; }
    hasGamepadWithIndex(index) { return !!(index in this.gamepads); }

    evaluateGamepads = (previousGamepads) => {
        Object
            .keys(this.gamepads)
            .forEach(index => {
                const gamepad = this.gamepads[index];
                const { buttons: previousButtons } = previousGamepads[index];
    
                this.evaluateButtonsChange(previousButtons, gamepad);
                this.evaluateAxesChange(gamepad);
            });
    };

    evaluateButtonsChange = (previousButtons, gamepad) => {
        gamepad.buttons.forEach((button, index) => {
            const current = parseButton(button, index);
            const previous = parseButton(previousButtons[index], index);

            if (current.pressed) {
                this.dispatchEvent({
                    type: BUTTON_PRESSED_EVENT,
                    button: current,
                    gamepad
                })
            } else if (previous.pressed) {
                this.dispatchEvent({
                    type: BUTTON_RELEASED_EVENT,
                    button: current,
                    gamepad
                })
            }
        });
    };

    evaluateAxesChange = (gamepad) => {
        const toFloat = (number, fixed) => parseFloat(number.toFixed(fixed));
        let joystick = 0;
        const axes = gamepad.axes;

        for (let i = 0; i<axes.length; i+= 2) {

            let x = toFloat(axes[i], 2);
            let y = toFloat(axes[i+1], 2);

            this.dispatchEvent({
                type: AXIS_CHANGE_EVENT,
                value: { x, y },
                gamepad,
                joystick
            })

            joystick++;
        }
    }

    updateGamepads() {
        getConnectedGamepads()
            .filter(isValidGamepad)
            .forEach(gamepad => {
                if (!this.hasGamepadWithIndex(gamepad.index)) {
                    this.addGamepad(gamepad);
                } else {
                    this.updateGamepadWithIndex(gamepad.index, gamepad);
                }
            });
    }

    update() { 
        if (this.enabled) {
            const previous = { ...this.gamepads };
            this.updateGamepads();
            this.evaluateGamepads(previous);
        }
    }
}