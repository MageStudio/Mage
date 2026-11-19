import { GameRunner } from "../GameRunner";
import { PATH_NOT_FOUND } from "../../lib/messages";

jest.mock("../../physics", () => ({
    __esModule: true,
    PHYSICS_STATES: { READY: "ready" },
    default: { waitForState: () => Promise.resolve() },
}));
jest.mock("../../core/Importer", () => ({
    Importer: { importLevelSnapshot: jest.fn(() => Promise.resolve()), parseLevelData: jest.fn() },
}));
jest.mock("../../core/config", () => ({
    __esModule: true,
    default: { getLevelData: jest.fn(() => ({})) },
}));
jest.mock("../../core/Assets", () => ({ __esModule: true, default: { load: jest.fn() } }));
jest.mock("../../audio/Audio", () => ({
    __esModule: true,
    default: { hasContext: jest.fn(() => false), context: null },
}));
jest.mock("../../core/input/Input", () => ({
    __esModule: true,
    default: { setPaused: jest.fn(), dispatchMissedReleases: jest.fn() },
}));
jest.mock("../../core/universe", () => ({ __esModule: true, default: {} }));
jest.mock("../../lib/easing", () => ({ clearAllTweens: jest.fn() }));
jest.mock("../../ui", () => ({ requestLoadingScreen: jest.fn(), removeLoadingScreen: jest.fn() }));
jest.mock("../../core/Level", () => ({ __esModule: true, default: class {} }));

const constructed = jest.fn();

class TestLevel {
    constructor() {
        constructed();
        this.dispose = jest.fn();
        this.onStart = jest.fn();
    }
    getPath() {
        return "/a";
    }
    prepareScene() {}
    init() {
        return Promise.resolve();
    }
}

describe("GameRunner.start with an unknown path", () => {
    test("rejects with PATH_NOT_FOUND and leaves the current level untouched", async () => {
        const runner = new GameRunner();
        runner.register("/a", TestLevel);
        await runner.start("/a");
        const current = runner.getCurrentLevel();
        const dispose = jest.spyOn(runner, "disposeCurrentLevel");
        constructed.mockClear();

        await expect(runner.start("/missing")).rejects.toBe(PATH_NOT_FOUND);

        expect(constructed).not.toHaveBeenCalled();
        expect(dispose).not.toHaveBeenCalled();
        expect(current.dispose).not.toHaveBeenCalled();
        expect(runner.getCurrentLevel()).toBe(current);
    });
});
