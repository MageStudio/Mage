/** @jest-environment jsdom */
jest.mock("hotkeys-js", () => {
    const fn = jest.fn();
    fn.unbind = jest.fn();
    return fn;
});

import Keyboard, { KEY_DOWN, KEY_UP, KEY_PRESS } from "../Keyboard";

const fire = (target, type, init = {}) => {
    const event = new KeyboardEvent(type, { key: "W", code: "KeyW", bubbles: true, ...init });
    target.dispatchEvent(event);
};

describe("Keyboard form-field guard", () => {
    let keyboard;
    let listeners;

    beforeEach(() => {
        document.body.innerHTML = "";
        keyboard = new Keyboard();
        listeners = { [KEY_DOWN]: jest.fn(), [KEY_UP]: jest.fn(), [KEY_PRESS]: jest.fn() };
        Object.keys(listeners).forEach(type => keyboard.addEventListener(type, listeners[type]));
        keyboard.enable();
    });

    afterEach(() => keyboard.disable());

    const editable = {
        input: () => document.createElement("input"),
        textarea: () => document.createElement("textarea"),
        select: () => document.createElement("select"),
        contenteditable: () => {
            const div = document.createElement("div");
            div.setAttribute("contenteditable", "true");
            const span = document.createElement("span");
            div.appendChild(span);
            return span;
        },
    };

    Object.keys(editable).forEach(kind => {
        it(`ignores key events typed into ${kind}`, () => {
            const target = editable[kind]();
            const host = target.closest("[contenteditable]") || target;
            document.body.appendChild(host);

            fire(target, "keydown");
            fire(target, "keypress");
            fire(target, "keyup");

            Object.values(listeners).forEach(fn => expect(fn).not.toHaveBeenCalled());
            expect(keyboard.pressedKeys.size).toBe(0);
            expect(keyboard.isPressed("w")).toBe(false);
        });
    });

    it("still dispatches when the target is the body or a contenteditable=false element", () => {
        const off = document.createElement("div");
        off.setAttribute("contenteditable", "false");
        document.body.appendChild(off);

        fire(document.body, "keydown");
        fire(off, "keydown");
        fire(document.body, "keypress");
        fire(document.body, "keyup");

        expect(listeners[KEY_DOWN]).toHaveBeenCalledTimes(2);
        expect(listeners[KEY_PRESS]).toHaveBeenCalledTimes(1);
        expect(listeners[KEY_UP]).toHaveBeenCalledTimes(1);
    });

    it("tracks pressedKeys for the canvas target", () => {
        fire(document.body, "keydown");
        expect(keyboard.isPressed("w")).toBe(true);
    });
});
