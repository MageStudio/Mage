jest.mock("three", () => {
    const three = require("../../../__mocks__/three");
    return { ...three, Raycaster: class Raycaster {} };
});
jest.mock("../../core/Scene", () => ({ getChildren: jest.fn(() => []) }));
jest.mock("../../physics", () => ({}));

import FirstPersonControl from "../FirstPersonControl";

const EVENTS = ["click", "mousemove", "keydown", "keyup", "pointerlockchange", "pointerlockerror"];

describe("FirstPersonControl document listeners", () => {
    let control;

    beforeEach(() => {
        global.document = Object.assign(new EventTarget(), {
            body: {},
            exitPointerLock: jest.fn(),
        });
        const camera = { position: { x: 0, y: 0, z: 0 }, setPosition: jest.fn() };
        control = new FirstPersonControl(camera, { requestPointerLock: jest.fn() });
    });

    afterEach(() => {
        delete global.document;
    });

    it("stops reaching its handlers after dispose", () => {
        const spies = {
            click: jest.spyOn(control, "onClick"),
            mousemove: jest.spyOn(control, "onMouseMove"),
            keydown: jest.spyOn(control, "onKeyDown"),
            keyup: jest.spyOn(control, "onKeyUp"),
            pointerlockchange: jest.spyOn(control, "onPointerlockChange"),
            pointerlockerror: jest.spyOn(control, "onPointerlockError"),
        };
        jest.spyOn(console, "error").mockImplementation(() => {});

        control.init();
        control.dispose();
        EVENTS.forEach(type => document.dispatchEvent(new Event(type)));

        EVENTS.forEach(type => expect(spies[type]).not.toHaveBeenCalled());
    });

    it("reaches its handlers while initialised", () => {
        control.init();
        document.dispatchEvent(Object.assign(new Event("keydown"), { keyCode: 87 }));

        expect(control.movement.forward).toBe(true);
    });
});
