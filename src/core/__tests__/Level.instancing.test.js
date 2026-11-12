const mockCalls = [];

jest.mock("../Scene", () => ({
    __esModule: true,
    default: {
        clock: { getDelta: () => 0.016 },
        create: jest.fn(),
        createCamera: jest.fn(),
        getRenderer: () => ({ info: { reset: () => mockCalls.push("info.reset"), render: {} } }),
        render: () => mockCalls.push("scene.render"),
        renderGizmoLayer: () => mockCalls.push("scene.renderGizmoLayer"),
        update: jest.fn(),
        dispose: () => mockCalls.push("scene.dispose"),
    },
}));
jest.mock("../Instancing", () => ({
    __esModule: true,
    default: {
        setEnabled: jest.fn(flag => mockCalls.push(`instancing.setEnabled(${flag})`)),
        isEnabled: jest.fn(() => false),
        update: jest.fn(() => mockCalls.push("instancing.update")),
    },
}));
jest.mock("../Stats", () => ({
    __esModule: true,
    default: { update: jest.fn(), init: jest.fn() },
}));
jest.mock("../Assets", () => ({ __esModule: true, default: { update: jest.fn() } }));
jest.mock("../input/Input", () => ({ __esModule: true, default: { update: jest.fn() } }));
jest.mock("../universe", () => ({ __esModule: true, default: { bigfreeze: jest.fn() } }));
jest.mock("../../audio/Audio", () => ({ __esModule: true, default: { dispose: jest.fn() } }));
jest.mock("../../physics", () => ({
    __esModule: true,
    default: { init: () => Promise.resolve(), dispose: jest.fn() },
}));
jest.mock("../../lights/Lights", () => ({ __esModule: true, default: { dispose: jest.fn() } }));
jest.mock("../../controls/Controls", () => ({
    __esModule: true,
    default: { update: jest.fn(), dispose: jest.fn() },
}));
jest.mock("../../fx/particles/Particles", () => ({
    __esModule: true,
    default: { update: jest.fn(), init: jest.fn(), dispose: jest.fn() },
}));
jest.mock("../../entities/camera", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("../../fx/postprocessing/PostProcessing", () => ({
    __esModule: true,
    default: { isEnabled: () => false, render: jest.fn(), init: jest.fn(), dispose: jest.fn() },
}));

import { Level } from "../Level";
import Instancing from "../Instancing";
import Config from "../config";

const makeLevel = () => {
    const level = new Level({});
    level.requestNextAnimationFrame = jest.fn();
    level.cancelNextAnimationFrame = jest.fn();
    return level;
};

describe("Level instancing wiring", () => {
    beforeEach(() => {
        mockCalls.length = 0;
        jest.clearAllMocks();
        Instancing.isEnabled.mockReturnValue(false);
        Config.config.common.rendering = undefined;
        Config.config.levels = {};
        Config.setCurrentLevel(null);
    });

    describe("init", () => {
        test("enables instancing from the common rendering config", async () => {
            Config.setConfig({ rendering: { instancing: true } });
            await makeLevel().init();
            expect(Instancing.setEnabled).toHaveBeenCalledWith(true);
        });

        test("enables instancing from a per-level rendering config", async () => {
            Config.setConfig({ levels: { Mine: { rendering: { instancing: true } } } });
            Config.setCurrentLevel("Mine");
            await makeLevel().init();
            expect(Instancing.setEnabled).toHaveBeenCalledWith(true);
        });

        test("stays disabled without a rendering key", async () => {
            await makeLevel().init();
            expect(Instancing.setEnabled).toHaveBeenCalledWith(false);
            expect(Instancing.setEnabled).not.toHaveBeenCalledWith(true);
        });
    });

    describe("render", () => {
        test("never updates instancing while disabled", () => {
            const level = makeLevel();
            level.render();
            level.render();
            level.render();
            expect(Instancing.update).not.toHaveBeenCalled();
        });

        test("updates instancing after info.reset and before any render call when enabled", () => {
            Instancing.isEnabled.mockReturnValue(true);
            makeLevel().render();
            expect(mockCalls[0]).toBe("info.reset");
            expect(mockCalls[1]).toBe("instancing.update");
            expect(mockCalls.indexOf("scene.render")).toBeGreaterThan(1);
        });
    });

    test("dispose disables instancing immediately before Scene.dispose", () => {
        makeLevel().dispose();
        const index = mockCalls.indexOf("instancing.setEnabled(false)");
        expect(index).toBeGreaterThanOrEqual(0);
        expect(mockCalls[index + 1]).toBe("scene.dispose");
    });
});
