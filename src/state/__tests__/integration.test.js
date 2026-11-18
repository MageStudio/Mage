jest.mock("../../lib/easing", () => ({
    pauseAllTweens: jest.fn(),
    resumeAllTweens: jest.fn(),
    clearAllTweens: jest.fn(),
    tweenTo: jest.fn(() => Promise.resolve()),
}));
jest.mock("../../lib/location", () => ({
    getLocationHash: jest.fn(),
    setLocationHash: jest.fn(),
}));
jest.mock("whatwg-fetch", () => ({ fetch: jest.fn() }));
jest.mock("../../core/Level", () => ({ __esModule: true, default: class Level {} }));
jest.mock("../../physics", () => ({
    __esModule: true,
    default: {
        waitForState: jest.fn(() => Promise.resolve()),
        pause: jest.fn(),
        resume: jest.fn(),
    },
    PHYSICS_STATES: { READY: "ready" },
}));
jest.mock("../../core/Importer", () => ({
    Importer: { importLevelSnapshot: jest.fn(() => Promise.resolve()) },
}));
jest.mock("../../core/Assets", () => ({
    __esModule: true,
    default: {
        setCurrentLevel: jest.fn(),
        setAssets: jest.fn(),
        load: jest.fn(() => Promise.resolve()),
    },
}));
jest.mock("../../lib/features", () => ({
    __esModule: true,
    default: {
        setUpPolyfills: jest.fn(),
        checkSupportedFeatures: jest.fn(() => Promise.resolve()),
    },
}));
jest.mock("../../ui/hud", () => ({
    __esModule: true,
    default: { clear: jest.fn(), loadHUD: jest.fn() },
}));
jest.mock("../../ui", () => ({
    requestLoadingScreen: jest.fn(),
    removeLoadingScreen: jest.fn(),
    mount: jest.fn(),
    unmount: jest.fn(),
}));
jest.mock("../../audio/Audio", () => ({
    __esModule: true,
    default: { hasContext: jest.fn(() => false), context: {} },
}));
jest.mock("../../core/input/Input", () => ({
    __esModule: true,
    default: { setPaused: jest.fn(), dispatchMissedReleases: jest.fn() },
}));
jest.mock("../../core/universe", () => ({
    __esModule: true,
    default: { onPause: jest.fn(), onResume: jest.fn() },
}));

import State from "../index";
import GameRunner from "../../runner/GameRunner";
import Router from "../../router/Router";
import Config from "../../core/config";
import { getLocationHash } from "../../lib/location";

const memoryAdapter = (initial = {}) => {
    const data = new Map(Object.entries(initial));

    return {
        getItem: key => (data.has(key) ? data.get(key) : null),
        setItem: (key, value) => data.set(key, value),
        removeItem: key => data.delete(key),
        keys: () => Array.from(data.keys()),
    };
};

const hooks = {};

class TestLevel {
    constructor(props) {
        this.props = props;
    }
    getPath() {
        return this.props.path;
    }
    prepareScene() {}
    init() {
        hooks.onCreate?.(this);
        return Promise.resolve();
    }
    dispose() {
        hooks.onDispose?.(this);
    }
}

describe("state integration with GameRunner and Router", () => {
    beforeEach(() => {
        Object.keys(hooks).forEach(key => delete hooks[key]);
        if (GameRunner.running) GameRunner.disposeCurrentLevel();
        State._endLevel();
        GameRunner.running = null;
        GameRunner.levelReady = false;
        GameRunner.store = {};
        GameRunner.register("/a", TestLevel);
        GameRunner.register("/b", TestLevel);
        State.hydrate({ version: 1, game: {}, level: {} });
        State.setStorage(memoryAdapter());
    });

    test("a fresh mage.state.get() is { game: {}, level: {} }", () => {
        expect(new State.constructor().get()).toEqual({ game: {}, level: {} });
    });

    test("calls _beginLevel right before the level is constructed", async () => {
        const calls = [];
        const begin = jest
            .spyOn(State, "_beginLevel")
            .mockImplementation(() => calls.push("begin"));
        GameRunner.register(
            "/a",
            class extends TestLevel {
                constructor(props) {
                    super(props);
                    calls.push("construct");
                }
            },
        );

        await GameRunner.start("/a");

        expect(calls).toEqual(["begin", "construct"]);
        begin.mockRestore();
    });

    test("disposes in order: onDispose, _endLevel, _resetLevel, history.clear", async () => {
        await GameRunner.start("/a");
        const calls = [];
        hooks.onDispose = () => calls.push("onDispose");
        const spies = [
            jest.spyOn(State, "_endLevel").mockImplementation(() => calls.push("end")),
            jest.spyOn(State, "_resetLevel").mockImplementation(() => calls.push("reset")),
            jest.spyOn(State.history, "clear").mockImplementation(() => calls.push("clear")),
        ];

        GameRunner.disposeCurrentLevel();

        expect(calls).toEqual(["onDispose", "end", "reset", "clear"]);
        spies.forEach(spy => spy.mockRestore());
    });

    test("level subscriptions end with the level; earlier ones survive; unsubscribe is idempotent", async () => {
        const early = jest.fn();
        const late = jest.fn();
        const unsubEarly = State.subscribe("game.n", early);
        let unsubLate;
        hooks.onCreate = () => {
            unsubLate = State.subscribe("game.n", late);
        };

        await GameRunner.start("/a");
        hooks.onCreate = undefined;
        State.set("game.n", 1);
        expect([early.mock.calls.length, late.mock.calls.length]).toEqual([1, 1]);

        await GameRunner.start("/b");
        State.set("game.n", 2);

        expect([early.mock.calls.length, late.mock.calls.length]).toEqual([2, 1]);
        expect(() => {
            unsubLate();
            unsubLate();
            unsubEarly();
            unsubEarly();
        }).not.toThrow();
    });

    test("a level change resets level, keeps game, lets onDispose read level, clears history", async () => {
        await GameRunner.start("/a");
        State.set("game.score", 5);
        State.set("level.coins", 3);
        expect(State.history.canUndo()).toBe(true);
        let seen;
        hooks.onDispose = () => {
            seen = State.get("level");
        };

        await GameRunner.start("/b");

        expect(seen).toEqual({ coins: 3 });
        expect(State.get("level")).toEqual({});
        expect(State.get("game")).toEqual({ score: 5 });
        expect(State.history.canUndo()).toBe(false);
    });

    test("restart() keeps game, resets level and clears history", async () => {
        await GameRunner.start("/a");
        State.set("game.score", 5);
        State.set("level.coins", 3);
        let seen;
        hooks.onDispose = () => {
            seen = State.get("level");
        };
        jest.useFakeTimers();
        const restarted = GameRunner.restart();
        jest.runAllTimers();
        await restarted;
        jest.useRealTimers();

        expect(seen).toEqual({ coins: 3 });
        expect(State.get("level")).toEqual({});
        expect(State.get("game")).toEqual({ score: 5 });
        expect(State.history.canUndo()).toBe(false);
    });
});

describe("Router.start and state", () => {
    let errors;

    beforeEach(() => {
        Object.keys(hooks).forEach(key => delete hooks[key]);
        if (GameRunner.running) GameRunner.disposeCurrentLevel();
        State._endLevel();
        errors = jest.spyOn(console, "error").mockImplementation(() => {});
        global.window = { addEventListener: jest.fn(), removeEventListener: jest.fn() };
        GameRunner.running = null;
        GameRunner.levelReady = false;
        GameRunner.store = {};
        Router.routes = [];
        Router.on("/a", TestLevel);
        Router.on("/b", TestLevel);
        getLocationHash.mockReturnValue("#/b");
        State._started = false;
        State.hydrate({ version: 1, game: {}, level: {} });
    });

    afterEach(() => {
        errors.mockRestore();
        delete global.window;
    });

    test("calls _start once with the common config, after setConfig and before the first level", async () => {
        const order = [];
        const setConfig = jest
            .spyOn(Config, "setConfig")
            .mockImplementation(() => order.push("config"));
        const stateConfig = jest.spyOn(Config, "state").mockReturnValue({ history: { limit: 7 } });
        const start = jest.spyOn(State, "_start").mockImplementation(() => order.push("_start"));
        hooks.onCreate = () => order.push("onCreate");

        await Router.start({}, {});

        expect(stateConfig).toHaveBeenCalledWith(null);
        expect(start).toHaveBeenCalledTimes(1);
        expect(start).toHaveBeenCalledWith({ history: { limit: 7 } });
        expect(order).toEqual(["config", "_start", "onCreate"]);
        [setConfig, stateConfig, start].forEach(spy => spy.mockRestore());
    });

    test("restores game from the saved slot before onCreate and starts the level from the hash", async () => {
        State.setStorage(
            memoryAdapter({
                "mage:save:autosave": JSON.stringify({
                    version: 1,
                    timestamp: 1,
                    path: "/a",
                    game: { score: 9 },
                }),
            }),
        );
        const stateConfig = jest
            .spyOn(Config, "state")
            .mockReturnValue({ persist: { slot: "autosave" } });
        let atCreate;
        let startedPath;
        hooks.onCreate = level => {
            atCreate = State.get("game");
            startedPath = level.getPath();
        };

        await Router.start({}, {});

        expect(atCreate).toEqual({ score: 9 });
        expect(startedPath).toBe("/b");
        stateConfig.mockRestore();
    });

    test("an unknown-version record creates no level and reaches handleStartError", async () => {
        State.setStorage(
            memoryAdapter({
                "mage:save:autosave": JSON.stringify({
                    version: 2,
                    timestamp: 1,
                    path: "/a",
                    game: {},
                }),
            }),
        );
        const stateConfig = jest
            .spyOn(Config, "state")
            .mockReturnValue({ persist: { slot: "autosave" } });
        const handle = jest.spyOn(Router, "handleStartError");
        const created = jest.fn();
        hooks.onCreate = created;

        await Router.start({}, {});

        expect(created).not.toHaveBeenCalled();
        expect(errors).toHaveBeenCalledWith(expect.any(Error));
        handle.mockRestore();
        stateConfig.mockRestore();
    });
});
