jest.mock("../../../store/Store", () => ({ dispatch: jest.fn() }));
jest.mock("../../../lib/features", () => ({
    __esModule: true,
    default: { isFeatureSupported: jest.fn(() => true) },
    FEATURES: { GAMEPADAPI: "gamepadapi" },
}));

import Gamepad, { BUTTON_PRESSED_EVENT, BUTTON_RELEASED_EVENT } from "../Gamepad";
import { installWindowStub } from "./helpers";

describe("Gamepad pausing", () => {
    let gamepad;

    beforeEach(() => {
        installWindowStub();
        gamepad = new Gamepad();
    });

    it("does not call plain listeners while paused but calls whilePaused ones", () => {
        const plain = jest.fn();
        const always = jest.fn();
        gamepad.addEventListener(BUTTON_PRESSED_EVENT, plain);
        gamepad.addEventListener(BUTTON_PRESSED_EVENT, always, { whilePaused: true });

        gamepad.setPaused(true);
        gamepad.dispatchEvent({ type: BUTTON_PRESSED_EVENT });

        expect(plain).not.toHaveBeenCalled();
        expect(always).toHaveBeenCalledTimes(1);
    });

    it("calls every listener again after unpausing", () => {
        const plain = jest.fn();
        const always = jest.fn();
        gamepad.addEventListener(BUTTON_PRESSED_EVENT, plain);
        gamepad.addEventListener(BUTTON_PRESSED_EVENT, always, { whilePaused: true });

        gamepad.setPaused(true);
        gamepad.setPaused(false);
        gamepad.dispatchEvent({ type: BUTTON_PRESSED_EVENT });

        expect(plain).toHaveBeenCalledTimes(1);
        expect(always).toHaveBeenCalledTimes(1);
    });

    it("does not call a removed whilePaused listener", () => {
        const always = jest.fn();
        gamepad.addEventListener(BUTTON_PRESSED_EVENT, always, { whilePaused: true });
        gamepad.removeEventListener(BUTTON_PRESSED_EVENT, always);

        gamepad.setPaused(true);
        gamepad.dispatchEvent({ type: BUTTON_PRESSED_EVENT });

        expect(always).not.toHaveBeenCalled();
    });

    it("dispatches releases only for snapshotted buttons no longer pressed", () => {
        const pad = {
            index: 0,
            buttons: [
                { pressed: true, value: 1 },
                { pressed: true, value: 1 },
            ],
        };
        gamepad.addGamepad(pad);
        const snapshot = gamepad.getPressedButtons();
        expect(snapshot).toHaveLength(2);

        gamepad.updateGamepadWithIndex(0, {
            index: 0,
            buttons: [
                { pressed: true, value: 1 },
                { pressed: false, value: 0 },
            ],
        });

        const released = jest.fn();
        gamepad.addEventListener(BUTTON_RELEASED_EVENT, released);
        gamepad.dispatchMissedReleases(snapshot);

        expect(released).toHaveBeenCalledTimes(1);
        expect(released.mock.calls[0][0].button.index).toBe(1);
    });
});
