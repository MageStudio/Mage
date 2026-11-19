jest.mock("hotkeys-js", () => {
    const fn = jest.fn();
    fn.unbind = jest.fn();
    return fn;
});

import Keyboard, { KEY_DOWN, KEY_UP, KEY_PRESS } from "../Keyboard";

const keyEvent = (type, init = { key: "a", code: "KeyA" }) => Object.assign(new Event(type), init);

describe("Keyboard window listeners", () => {
    let keyboard;

    beforeEach(() => {
        global.window = new EventTarget();
        keyboard = new Keyboard();
    });

    afterEach(() => {
        delete global.window;
    });

    it("handles one keydown once after enable, disable, enable", () => {
        const onKeyDown = jest.fn();
        keyboard.addEventListener(KEY_DOWN, onKeyDown);

        keyboard.enable();
        keyboard.disable();
        keyboard.enable();
        window.dispatchEvent(keyEvent("keydown"));

        expect(onKeyDown).toHaveBeenCalledTimes(1);
    });

    it("stops handling keydown, keyup and keypress after disable", () => {
        const handler = jest.fn();
        keyboard.addEventListener(KEY_DOWN, handler);
        keyboard.addEventListener(KEY_UP, handler);
        keyboard.addEventListener(KEY_PRESS, handler);

        keyboard.enable();
        keyboard.disable();
        window.dispatchEvent(keyEvent("keydown"));
        window.dispatchEvent(keyEvent("keyup"));
        window.dispatchEvent(keyEvent("keypress"));

        expect(handler).not.toHaveBeenCalled();
    });
});
