jest.mock("three", () => require("../../../__mocks__/three"));

import FlyControl from "../FlyControl";

describe("FlyControl dispose", () => {
    it("removes the mousemove listener it added", () => {
        const domElement = {
            setAttribute: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
        };
        global.window = new EventTarget();
        const control = new FlyControl({}, domElement);
        control.updateMovementVector = jest.fn();
        control.updateRotationVector = jest.fn();

        control.init();
        control.dispose();

        expect(domElement.removeEventListener).toHaveBeenCalledWith(
            "mousemove",
            control.onMouseMove,
            false,
        );
        delete global.window;
    });
});
