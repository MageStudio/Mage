jest.mock("three", () => require("../../../__mocks__/three"));
jest.mock("xstate", () => ({
    createMachine: jest.fn(),
    interpret: jest.fn(() => ({
        start: jest.fn(),
        stop: jest.fn(),
        send: jest.fn(),
        onTransition: jest.fn(),
    })),
}));
jest.mock("../../scripts/Scripts", () => ({
    get: jest.fn(),
}));
jest.mock("../../core/Scene", () => ({}));
jest.mock("../../core/universe", () => ({
    getByTag: jest.fn(() => []),
}));
jest.mock("../../lib/easing", () => ({
    tweenTo: jest.fn(() => Promise.resolve()),
}));
jest.mock("../../lib/meshUtils", () => ({
    isScene: jest.fn(() => false),
    serializeQuaternion: jest.fn(q => q && { x: q.x, y: q.y, z: q.z, w: q.w }),
    serializeVector: jest.fn(v => v && { x: v.x, y: v.y, z: v.z }),
}));

import Entity from "../Entity";

describe("Entity pause hooks", () => {
    const makeScript = () => ({ onPause: jest.fn(), onResume: jest.fn() });

    test("onPause and onResume call the hook on enabled dynamic scripts only", () => {
        const entity = new Entity();
        const on = makeScript();
        const off = makeScript();
        entity.dynamicScripts = [
            { script: on, enabled: true },
            { script: off, enabled: false },
            { script: null, enabled: true },
        ];

        entity.onPause();
        entity.onResume();

        expect(on.onPause).toHaveBeenCalledTimes(1);
        expect(on.onResume).toHaveBeenCalledTimes(1);
        expect(off.onPause).not.toHaveBeenCalled();
        expect(off.onResume).not.toHaveBeenCalled();
    });

    test("does nothing without scripts", () => {
        const entity = new Entity();
        expect(() => {
            entity.onPause();
            entity.onResume();
        }).not.toThrow();
    });
});
