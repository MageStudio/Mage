jest.mock("hotkeys-js", () => {
    const fn = jest.fn();
    fn.unbind = jest.fn();
    return fn;
});
jest.mock("../../Scene", () => ({
    getDOMElement: jest.fn(() => ({ addEventListener: jest.fn(), removeEventListener: jest.fn() })),
    getCameraBody: jest.fn(),
    getChildren: jest.fn(() => []),
}));
jest.mock("../../config", () => ({
    container: jest.fn(() => ({ getBoundingClientRect: () => ({ left: 0, top: 0 }) })),
    screen: jest.fn(() => ({ w: 100, h: 100 })),
}));
jest.mock("../../universe", () => ({ find: jest.fn() }));
jest.mock("../../../store/Store", () => ({ dispatch: jest.fn() }));
jest.mock("../../../lib/features", () => ({
    __esModule: true,
    default: { isFeatureSupported: jest.fn(() => true) },
    FEATURES: { GAMEPADAPI: "gamepadapi" },
}));

import { Input } from "../Input";
import { KEY_DOWN } from "../Keyboard";
import { BUTTON_RELEASED_EVENT } from "../Gamepad";
import { installWindowStub, windowEventsOfType } from "./helpers";

describe("Input pausing", () => {
    let input;

    beforeEach(() => {
        installWindowStub();
        global.document = { addEventListener: jest.fn(), removeEventListener: jest.fn() };
        input = new Input();
    });

    it("does not call plain listeners while paused but calls whilePaused ones", () => {
        const plain = jest.fn();
        const always = jest.fn();
        input.addEventListener(KEY_DOWN, plain);
        input.addEventListener(KEY_DOWN, always, { whilePaused: true });

        input.setPaused(true);
        input.dispatchEvent({ type: KEY_DOWN });

        expect(plain).not.toHaveBeenCalled();
        expect(always).toHaveBeenCalledTimes(1);
    });

    it("calls both after setPaused(false), and not a removed whilePaused listener", () => {
        const plain = jest.fn();
        const always = jest.fn();
        const removed = jest.fn();
        input.addEventListener(KEY_DOWN, plain);
        input.addEventListener(KEY_DOWN, always, { whilePaused: true });
        input.addEventListener(KEY_DOWN, removed, { whilePaused: true });
        input.removeEventListener(KEY_DOWN, removed);

        input.setPaused(true);
        input.dispatchEvent({ type: KEY_DOWN });
        input.setPaused(false);
        input.dispatchEvent({ type: KEY_DOWN });

        expect(plain).toHaveBeenCalledTimes(1);
        expect(always).toHaveBeenCalledTimes(2);
        expect(removed).not.toHaveBeenCalled();
    });

    it("pauses every device and skips devices removed by disable*", () => {
        input.setPaused(true);
        expect(input.keyboard.paused).toBe(true);
        expect(input.mouse.paused).toBe(true);
        expect(input.gamepad.paused).toBe(true);

        input.mouse = undefined;
        input.gamepad = null;
        expect(() => input.setPaused(false)).not.toThrow();
        expect(input.keyboard.paused).toBe(false);
    });

    it("propagates device events to whilePaused listeners while paused", () => {
        input.enableKeyboard();
        const plain = jest.fn();
        const always = jest.fn();
        input.addEventListener(KEY_DOWN, plain);
        input.addEventListener(KEY_DOWN, always, { whilePaused: true });

        input.setPaused(true);
        input.keyboard.handleKeydown({ key: "a", code: "KeyA" });

        expect(plain).not.toHaveBeenCalled();
        expect(always).toHaveBeenCalledTimes(1);
    });

    it("emits no events on setPaused(false)", () => {
        input.keyboard.handleKeydown({ key: "a", code: "KeyA" });
        input.setPaused(true);
        input.keyboard.handleKeyup({ key: "a", code: "KeyA" });
        input.setPaused(false);

        expect(global.window.dispatchEvent).not.toHaveBeenCalled();
    });

    it("dispatches exactly one keyup for a key released during the pause", () => {
        input.keyboard.handleKeydown({ key: "a", code: "KeyA" });
        input.setPaused(true);
        input.keyboard.handleKeyup({ key: "a", code: "KeyA" });
        input.setPaused(false);
        input.dispatchMissedReleases();

        const ups = windowEventsOfType("keyup");
        expect(ups).toHaveLength(1);
        expect(ups[0]).toMatchObject({ key: "a", code: "KeyA" });

        input.dispatchMissedReleases();
        expect(windowEventsOfType("keyup")).toHaveLength(1);
    });

    it("dispatches nothing for a key still held", () => {
        input.keyboard.handleKeydown({ key: "a", code: "KeyA" });
        input.setPaused(true);
        input.setPaused(false);
        input.dispatchMissedReleases();

        expect(global.window.dispatchEvent).not.toHaveBeenCalled();
    });

    it("dispatches mouseup for a button released during the pause only", () => {
        input.mouse.buttonsDown.add(0);
        input.mouse.buttonsDown.add(2);
        input.setPaused(true);
        input.mouse.buttonsDown.delete(0);
        input.setPaused(false);
        input.dispatchMissedReleases();

        const ups = windowEventsOfType("mouseup");
        expect(ups).toHaveLength(1);
        expect(ups[0].button).toBe(0);
    });

    it("dispatches a gamepad button release for a button released during the pause", () => {
        input.gamepad.addGamepad({ index: 0, buttons: [{ pressed: true, value: 1 }] });
        const released = jest.fn();
        input.gamepad.addEventListener(BUTTON_RELEASED_EVENT, released);

        input.setPaused(true);
        input.gamepad.updateGamepadWithIndex(0, {
            index: 0,
            buttons: [{ pressed: false, value: 0 }],
        });
        input.setPaused(false);
        input.dispatchMissedReleases();

        expect(released).toHaveBeenCalledTimes(1);
    });
});
