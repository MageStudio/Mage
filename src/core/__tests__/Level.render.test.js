const mockCalls = [];

jest.mock("../Scene", () => ({
    __esModule: true,
    default: {
        clock: { getDelta: () => 0.016 },
        getRenderer: () => ({ info: mockInfo }),
        render: () => mockCalls.push("scene.render"),
        renderGizmoLayer: () => mockCalls.push("scene.renderGizmoLayer"),
        update: jest.fn(),
    },
}));
const mockInfo = { reset: () => mockCalls.push("info.reset"), render: { calls: 0, triangles: 0 } };

jest.mock("../Stats", () => ({
    __esModule: true,
    default: { update: jest.fn() },
}));
jest.mock("../Assets", () => ({ __esModule: true, default: { update: jest.fn() } }));
jest.mock("../input/Input", () => ({ __esModule: true, default: { update: jest.fn() } }));
jest.mock("../../audio/Audio", () => ({ __esModule: true, default: {} }));
jest.mock("../../physics", () => ({ __esModule: true, default: {} }));
jest.mock("../../lights/Lights", () => ({ __esModule: true, default: {} }));
jest.mock("../../controls/Controls", () => ({ __esModule: true, default: { update: jest.fn() } }));
jest.mock("../../fx/particles/Particles", () => ({
    __esModule: true,
    default: { update: jest.fn() },
}));
jest.mock("../../entities/camera", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("../../fx/postprocessing/PostProcessing", () => ({
    __esModule: true,
    default: { isEnabled: () => false, render: jest.fn() },
}));

import { Level } from "../Level";
import Stats from "../Stats";

describe("Level.render", () => {
    beforeEach(() => {
        mockCalls.length = 0;
        jest.clearAllMocks();
        global.requestAnimationFrame = jest.fn(() => 1);
    });

    test("resets renderer.info before any render call", () => {
        const level = new Level({});
        level.requestNextAnimationFrame = jest.fn();
        level.render();

        expect(mockCalls[0]).toBe("info.reset");
        expect(mockCalls.indexOf("scene.render")).toBeGreaterThan(0);
        expect(mockCalls.indexOf("scene.renderGizmoLayer")).toBeGreaterThan(0);
    });

    test("passes renderer info to Stats.update", () => {
        const level = new Level({});
        level.requestNextAnimationFrame = jest.fn();
        level.render();

        expect(Stats.update).toHaveBeenCalledWith(0.016, mockInfo);
    });
});
