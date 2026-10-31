import { GameRunner } from "../GameRunner";
import { Importer } from "../../core/Importer";
import config from "../../core/config";
import Assets from "../../core/Assets";
import Input from "../../core/input/Input";
import { requestLoadingScreen, removeLoadingScreen } from "../../ui";

jest.mock("../../store/Store", () => ({ subscribe: jest.fn(), unsubscribeAll: jest.fn() }));
jest.mock("../../storage/storage", () => ({
    __esModule: true,
    default: { load: jest.fn(() => Promise.resolve()) },
}));
jest.mock("../../physics", () => ({
    __esModule: true,
    PHYSICS_STATES: { READY: "ready" },
    default: { waitForState: () => Promise.resolve(), pause: jest.fn(), resume: jest.fn() },
}));
jest.mock("../../core/Importer", () => ({
    Importer: {
        importLevelSnapshot: jest.fn(() => Promise.resolve()),
        parseLevelData: jest.fn(),
    },
}));
jest.mock("../../core/config", () => ({
    __esModule: true,
    default: { getLevelData: jest.fn(() => ({ data: 1 })) },
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
jest.mock("../../core/Level", () => ({ __esModule: true, default: class {} }));

const instances = [];

class TestLevel {
    constructor(cfg) {
        this.cfg = cfg;
        this.onCreate = jest.fn();
        this.onStart = jest.fn();
        this.dispose = jest.fn();
        this.__setPaused = jest.fn();
        this.onPause = jest.fn();
        this.onResume = jest.fn();
        this.created = true;
        this.onCreate();
        instances.push(this);
    }
    prepareScene() {}
    init() {
        return Promise.resolve();
    }
    getPath() {
        return this.cfg.path;
    }
}

describe("GameRunner.restart", () => {
    let runner;

    beforeEach(async () => {
        jest.clearAllMocks();
        instances.length = 0;
        runner = new GameRunner();
        runner.register("/a", TestLevel);
        await runner.start("/a", { foo: "bar" });
        jest.useFakeTimers();
    });

    afterEach(() => jest.useRealTimers());

    const flush = async () => {
        jest.runOnlyPendingTimers();
        for (let i = 0; i < 10; i++) await Promise.resolve();
    };

    it("returns the same promise for two calls in one tick and restarts once", async () => {
        const first = instances[0];
        const p1 = runner.restart();
        const p2 = runner.restart();
        expect(p1).toBe(p2);
        expect(requestLoadingScreen).not.toHaveBeenCalled();

        await flush();
        const level = await p1;

        expect(first.dispose).toHaveBeenCalledTimes(1);
        expect(instances).toHaveLength(2);
        expect(level).toBe(instances[1]);
        expect(level.onCreate).toHaveBeenCalled();
        expect(level.onStart).toHaveBeenCalled();
        expect(level.cfg).toEqual({ foo: "bar", path: "/a" });
        expect(requestLoadingScreen).toHaveBeenCalledTimes(1);
        expect(removeLoadingScreen).toHaveBeenCalledTimes(1);
        expect(config.getLevelData).toHaveBeenCalledWith("/a");
        expect(Importer.importLevelSnapshot).toHaveBeenLastCalledWith({ data: 1 });
        expect(Assets.load).not.toHaveBeenCalled();
    });

    it("clears the in-flight promise once settled", async () => {
        const p1 = runner.restart();
        await flush();
        await p1;
        const p2 = runner.restart();
        expect(p2).not.toBe(p1);
        await flush();
        await p2;
        expect(instances).toHaveLength(3);
    });

    it("starts unpaused when restarted while paused", async () => {
        runner.pause();
        expect(runner.isPaused()).toBe(true);
        const p = runner.restart();
        await flush();
        await p;
        expect(runner.paused).toBe(false);
        expect(Input.setPaused).toHaveBeenLastCalledWith(false);
        expect(runner.isPaused()).toBe(false);
    });

    it("returns the in-flight promise even though no level is ready mid-restart", async () => {
        const p1 = runner.restart();
        jest.runOnlyPendingTimers(); // disposed, new level not ready yet
        expect(runner.restart()).toBe(p1);
        await flush();
        await p1;
    });

    it("rejects and clears the in-flight promise when the loading screen request throws", async () => {
        requestLoadingScreen.mockImplementationOnce(() => {
            throw new Error("boom");
        });
        const p1 = runner.restart();
        const rejection = expect(p1).rejects.toThrow("boom");
        await flush();
        await rejection;
        expect(removeLoadingScreen).toHaveBeenCalledTimes(1);

        const p2 = runner.restart();
        expect(p2).not.toBe(p1);
        await flush();
        await p2;
        expect(instances).toHaveLength(2);
    });

    it("rejects when dispose throws and does not leave a dead promise behind", async () => {
        instances[0].dispose.mockImplementation(() => {
            throw new Error("dispose failed");
        });
        const p1 = runner.restart();
        const rejection = expect(p1).rejects.toThrow("dispose failed");
        await flush();
        await rejection;
        expect(removeLoadingScreen).toHaveBeenCalledTimes(1);
        expect(runner.restartPromise).toBeNull();
        // no level is running any more, so a retry fails fast instead of returning p1
        expect(() => runner.restart()).toThrow("no level is running");
    });

    it("rejects and removes the loading screen when start rejects", async () => {
        Importer.importLevelSnapshot.mockImplementationOnce(() =>
            Promise.reject(new Error("import failed")),
        );
        const p1 = runner.restart();
        const rejection = expect(p1).rejects.toThrow("import failed");
        await flush();
        await rejection;
        expect(removeLoadingScreen).toHaveBeenCalledTimes(1);
        expect(runner.restartPromise).toBeNull();
    });
});
