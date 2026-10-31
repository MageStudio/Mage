import { GameRunner } from "../GameRunner";
import Physics from "../../physics";
import Audio from "../../audio/Audio";
import Input from "../../core/input/Input";
import Universe from "../../core/universe";
import { pauseAllTweens, resumeAllTweens, clearAllTweens } from "../../lib/easing";

jest.mock("../../store/Store", () => ({ subscribe: jest.fn(), unsubscribeAll: jest.fn() }));
jest.mock("../../storage/storage", () => ({
    __esModule: true,
    default: { load: jest.fn(() => Promise.resolve()) },
}));
jest.mock("../../physics", () => ({
    __esModule: true,
    PHYSICS_STATES: { READY: "ready" },
    default: {
        waitForState: () => Promise.resolve(),
        pause: jest.fn(),
        resume: jest.fn(),
    },
}));
jest.mock("../../core/Importer", () => ({
    Importer: {
        importLevelSnapshot: jest.fn(() => Promise.resolve()),
        parseLevelData: jest.fn(),
    },
}));
jest.mock("../../core/config", () => ({
    __esModule: true,
    default: { getLevelData: jest.fn(() => ({})) },
}));
jest.mock("../../audio/Audio", () => ({
    __esModule: true,
    default: {
        hasContext: jest.fn(() => true),
        context: { suspend: jest.fn(), resume: jest.fn() },
    },
}));
jest.mock("../../core/input/Input", () => ({
    __esModule: true,
    default: { setPaused: jest.fn(), dispatchMissedReleases: jest.fn() },
}));
jest.mock("../../core/universe", () => ({
    __esModule: true,
    default: { onPause: jest.fn(), onResume: jest.fn() },
}));
jest.mock("../../lib/easing", () => ({
    pauseAllTweens: jest.fn(),
    resumeAllTweens: jest.fn(),
    clearAllTweens: jest.fn(),
}));
jest.mock("../../ui", () => ({
    requestLoadingScreen: jest.fn(),
    removeLoadingScreen: jest.fn(),
}));
jest.mock("../../core/Level", () => ({
    __esModule: true,
    default: class {},
}));

const calls = [];
let lastLevel;

class TestLevel {
    constructor(config) {
        this.config = config;
        lastLevel = this;
    }
    prepareScene() {}
    init() {
        return Promise.resolve();
    }
    getPath() {
        return this.config.path;
    }
    __setPaused = jest.fn(flag => calls.push(`level.__setPaused(${flag})`));
    onPause = jest.fn(() => calls.push("level.onPause"));
    onResume = jest.fn(() => calls.push("level.onResume"));
    dispose = jest.fn();
}

const startLevel = async (runner, path = "/a", options) => {
    runner.register(path, TestLevel);
    await runner.start(path, options);
    return lastLevel;
};

describe("GameRunner pause/resume", () => {
    let runner;

    beforeEach(() => {
        jest.clearAllMocks();
        calls.length = 0;
        Audio.hasContext.mockReturnValue(true);
        runner = new GameRunner();
    });

    it("throws per method when no level is running", () => {
        ["pause", "resume", "togglePause", "restart"].forEach(method => {
            expect(() => runner[method]()).toThrow(`GameRunner.${method}: no level is running`);
        });
        expect(runner.isPaused()).toBe(false);
    });

    it("allows pause() inside onStart", async () => {
        class StartPauses extends TestLevel {
            onStart() {
                runner.pause();
            }
        }
        runner.register("/b", StartPauses);
        await runner.start("/b");
        expect(runner.isPaused()).toBe(true);
    });

    it("freezes then calls level hook then Universe hook", async () => {
        const level = await startLevel(runner);
        Physics.pause.mockImplementation(() => calls.push("physics.pause"));
        Input.setPaused.mockImplementation(f => calls.push(`input.setPaused(${f})`));
        Universe.onPause.mockImplementation(() => calls.push("universe.onPause"));

        runner.pause();

        expect(runner.isPaused()).toBe(true);
        expect(pauseAllTweens).toHaveBeenCalled();
        expect(calls).toEqual([
            "level.__setPaused(true)",
            "physics.pause",
            "input.setPaused(true)",
            "level.onPause",
            "universe.onPause",
        ]);
        expect(level.onPause).toHaveBeenCalledTimes(1);
    });

    it("pause() twice calls onPause once", async () => {
        const level = await startLevel(runner);
        runner.pause();
        runner.pause();
        expect(level.onPause).toHaveBeenCalledTimes(1);
        expect(Universe.onPause).toHaveBeenCalledTimes(1);
    });

    it("resume() while not paused calls no hook", async () => {
        const level = await startLevel(runner);
        runner.resume();
        expect(level.onResume).not.toHaveBeenCalled();
        expect(Universe.onResume).not.toHaveBeenCalled();
        expect(Physics.resume).not.toHaveBeenCalled();
    });

    it("dispatchMissedReleases runs before level.onResume", async () => {
        const level = await startLevel(runner);
        Input.dispatchMissedReleases.mockImplementation(() => calls.push("missedReleases"));
        Universe.onResume.mockImplementation(() => calls.push("universe.onResume"));
        runner.pause();
        calls.length = 0;
        Input.setPaused.mockImplementation(f => calls.push(`input.setPaused(${f})`));

        runner.resume();

        expect(resumeAllTweens).toHaveBeenCalled();
        expect(Physics.resume).toHaveBeenCalled();
        expect(calls).toEqual([
            "level.__setPaused(false)",
            "input.setPaused(false)",
            "missedReleases",
            "level.onResume",
            "universe.onResume",
        ]);
        expect(level.onResume).toHaveBeenCalledTimes(1);
        expect(runner.isPaused()).toBe(false);
    });

    it("suspends and resumes the audio context", async () => {
        await startLevel(runner);
        runner.pause();
        expect(Audio.context.suspend).toHaveBeenCalledTimes(1);
        runner.resume();
        expect(Audio.context.resume).toHaveBeenCalledTimes(1);
    });

    it("pause({ audio: false }) leaves audio alone", async () => {
        await startLevel(runner);
        runner.pause({ audio: false });
        runner.resume();
        expect(Audio.context.suspend).not.toHaveBeenCalled();
        expect(Audio.context.resume).not.toHaveBeenCalled();
    });

    it("skips audio without a context", async () => {
        Audio.hasContext.mockReturnValue(false);
        await startLevel(runner);
        runner.pause();
        runner.resume();
        expect(Audio.context.suspend).not.toHaveBeenCalled();
        expect(Audio.context.resume).not.toHaveBeenCalled();
    });

    it("togglePause alternates", async () => {
        await startLevel(runner);
        runner.togglePause();
        expect(runner.isPaused()).toBe(true);
        runner.togglePause();
        expect(runner.isPaused()).toBe(false);
    });

    it("tolerates levels without hook methods", async () => {
        class Bare {
            prepareScene() {}
            init() {
                return Promise.resolve();
            }
            getPath() {
                return "/c";
            }
            __setPaused() {}
            dispose() {}
        }
        runner.register("/c", Bare);
        await runner.start("/c");
        expect(() => {
            runner.pause();
            runner.resume();
        }).not.toThrow();
    });

    it("starting another path from a paused level resets pause state", async () => {
        await startLevel(runner, "/a");
        runner.pause();
        runner.register("/d", TestLevel);
        await runner.start("/d");
        expect(runner.isPaused()).toBe(false);
        expect(Audio.context.resume).toHaveBeenCalledTimes(1);
        expect(Input.setPaused).toHaveBeenLastCalledWith(false);
        expect(clearAllTweens).toHaveBeenCalled();
    });

    it("dispose does not resume audio that this pause did not suspend", async () => {
        await startLevel(runner);
        runner.pause({ audio: false });
        runner.disposeCurrentLevel();
        expect(Audio.context.resume).not.toHaveBeenCalled();
        expect(runner.isPaused()).toBe(false);
    });
});
