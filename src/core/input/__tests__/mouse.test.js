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

import Mouse, { MOUSE_MOVE } from "../Mouse";
import { installWindowStub } from "./helpers";

describe("Mouse pausing", () => {
    let mouse;

    beforeEach(() => {
        installWindowStub();
        mouse = new Mouse();
    });

    it("does not call plain listeners while paused but calls whilePaused ones", () => {
        const plain = jest.fn();
        const always = jest.fn();
        mouse.addEventListener(MOUSE_MOVE, plain);
        mouse.addEventListener(MOUSE_MOVE, always, { whilePaused: true });

        mouse.setPaused(true);
        mouse.dispatchEvent({ type: MOUSE_MOVE });

        expect(plain).not.toHaveBeenCalled();
        expect(always).toHaveBeenCalledTimes(1);
    });

    it("calls every listener again after unpausing", () => {
        const plain = jest.fn();
        const always = jest.fn();
        mouse.addEventListener(MOUSE_MOVE, plain);
        mouse.addEventListener(MOUSE_MOVE, always, { whilePaused: true });

        mouse.setPaused(true);
        mouse.setPaused(false);
        mouse.dispatchEvent({ type: MOUSE_MOVE });

        expect(plain).toHaveBeenCalledTimes(1);
        expect(always).toHaveBeenCalledTimes(1);
    });

    it("does not call a removed whilePaused listener", () => {
        const always = jest.fn();
        mouse.addEventListener(MOUSE_MOVE, always, { whilePaused: true });
        mouse.removeEventListener(MOUSE_MOVE, always);

        mouse.setPaused(true);
        mouse.dispatchEvent({ type: MOUSE_MOVE });

        expect(always).not.toHaveBeenCalled();
    });

    it("tracks buttons down and up even while paused", () => {
        mouse.enabled = true;
        mouse.getIntersections = jest.fn(() => []);
        const evt = button => ({ button, clientX: 0, clientY: 0, preventDefault: jest.fn() });
        mouse.setPaused(true);

        mouse.onMouseDown(evt(0));
        expect(mouse.buttonsDown.has(0)).toBe(true);

        mouse.onMouseUp(evt(0));
        expect(mouse.buttonsDown.has(0)).toBe(false);
    });
});
