const mockCalls = [];
const track = name => jest.fn(() => mockCalls.push(name));

jest.mock("three", () => require("../../../__mocks__/three"));
jest.mock("../Assets", () => ({ update: track("Assets.update") }));
jest.mock("../universe", () => ({}));
jest.mock("../Scene", () => ({
    clock: { getDelta: jest.fn(() => 0.5) },
    render: track("Scene.render"),
    renderGizmoLayer: track("Scene.renderGizmoLayer"),
    update: track("Scene.update"),
}));
jest.mock("../Stats", () => ({ update: track("Stats.update") }));
jest.mock("../../audio/Audio", () => ({}));
jest.mock("../../fx/postprocessing/PostProcessing", () => ({
    isEnabled: jest.fn(() => false),
    render: track("PostProcessing.render"),
}));
jest.mock("../../fx/particles/Particles", () => ({ update: track("Particles.update") }));
jest.mock("../input/Input", () => ({ update: track("Input.update") }));
jest.mock("../../lights/Lights", () => ({}));
jest.mock("../../controls/Controls", () => ({ update: track("Controls.update") }));
jest.mock("../../physics", () => ({}));
jest.mock("../../entities/camera", () => jest.fn());

import Level from "../Level";
import Scene from "../Scene";
import PostProcessing from "../../fx/postprocessing/PostProcessing";

describe("Level pause", () => {
    let level;

    beforeEach(() => {
        mockCalls.length = 0;
        global.requestNextFrame = jest.fn(() => {
            mockCalls.push("requestNextFrame");
            return 1;
        });
        level = new Level({ path: "/" });
        level.onUpdate = jest.fn(() => mockCalls.push("onUpdate"));
        PostProcessing.isEnabled.mockReturnValue(false);
    });

    test("is not paused by default and toggles with __setPaused", () => {
        expect(level.__isPaused()).toBe(false);
        level.__setPaused(true);
        expect(level.__isPaused()).toBe(true);
        level.__setPaused(false);
        expect(level.__isPaused()).toBe(false);
    });

    test("has empty onPause and onResume hooks", () => {
        expect(() => {
            level.onPause();
            level.onResume();
        }).not.toThrow();
    });

    test("running render keeps the original order", () => {
        level.render();

        expect(mockCalls).toEqual([
            "Scene.render",
            "Scene.renderGizmoLayer",
            "Particles.update",
            "onUpdate",
            "Scene.update",
            "Assets.update",
            "Stats.update",
            "Controls.update",
            "Input.update",
            "requestNextFrame",
        ]);
        expect(level.onUpdate).toHaveBeenCalledWith(0.5);
    });

    test("paused render skips gameplay updates but still renders and schedules", () => {
        level.__setPaused(true);
        level.render();

        expect(Scene.clock.getDelta).toHaveBeenCalled();
        expect(mockCalls).toEqual([
            "Scene.render",
            "Scene.renderGizmoLayer",
            "Stats.update",
            "Input.update",
            "requestNextFrame",
        ]);
    });

    test("paused render uses PostProcessing when enabled", () => {
        PostProcessing.isEnabled.mockReturnValue(true);
        level.__setPaused(true);
        level.render();

        expect(mockCalls).toEqual([
            "PostProcessing.render",
            "Scene.renderGizmoLayer",
            "Stats.update",
            "Input.update",
            "requestNextFrame",
        ]);
    });
});
