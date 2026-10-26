jest.mock("hotkeys-js", () => {
    const fn = jest.fn();
    fn.unbind = jest.fn();
    return fn;
});

import Keyboard, { KEY_DOWN } from "../Keyboard";
import { installWindowStub } from "./helpers";

describe("Keyboard pausing", () => {
    let keyboard;

    beforeEach(() => {
        installWindowStub();
        keyboard = new Keyboard();
    });

    it("does not call plain listeners while paused but calls whilePaused ones", () => {
        const plain = jest.fn();
        const always = jest.fn();
        keyboard.addEventListener(KEY_DOWN, plain);
        keyboard.addEventListener(KEY_DOWN, always, { whilePaused: true });

        keyboard.setPaused(true);
        keyboard.dispatchEvent({ type: KEY_DOWN });

        expect(plain).not.toHaveBeenCalled();
        expect(always).toHaveBeenCalledTimes(1);
    });

    it("calls every listener again after unpausing", () => {
        const plain = jest.fn();
        const always = jest.fn();
        keyboard.addEventListener(KEY_DOWN, plain);
        keyboard.addEventListener(KEY_DOWN, always, { whilePaused: true });

        keyboard.setPaused(true);
        keyboard.setPaused(false);
        keyboard.dispatchEvent({ type: KEY_DOWN });

        expect(plain).toHaveBeenCalledTimes(1);
        expect(always).toHaveBeenCalledTimes(1);
    });

    it("does not call a removed whilePaused listener", () => {
        const always = jest.fn();
        keyboard.addEventListener(KEY_DOWN, always, { whilePaused: true });
        keyboard.removeEventListener(KEY_DOWN, always);

        keyboard.setPaused(true);
        keyboard.dispatchEvent({ type: KEY_DOWN });

        expect(always).not.toHaveBeenCalled();
        expect(keyboard.whilePausedListeners.size).toBe(0);
    });

    it("keeps isPressed and keysDown updated while paused", () => {
        keyboard.setPaused(true);
        keyboard.handleKeydown({ key: "A", code: "KeyA" });

        expect(keyboard.isPressed("a")).toBe(true);
        expect(keyboard.keysDown.get("KeyA")).toBe("A");

        keyboard.handleKeyup({ key: "A", code: "KeyA" });

        expect(keyboard.isPressed("a")).toBe(false);
        expect(keyboard.keysDown.has("KeyA")).toBe(false);
    });
});
