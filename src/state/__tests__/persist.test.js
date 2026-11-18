jest.mock("../../runner/GameRunner", () => ({ getCurrentPath: jest.fn(() => "/level1") }));

import { State } from "../index";

const memoryAdapter = (initial = {}) => {
    const data = new Map(Object.entries(initial));

    return {
        data,
        getItem: jest.fn(key => (data.has(key) ? data.get(key) : null)),
        setItem: jest.fn((key, value) => data.set(key, value)),
        removeItem: jest.fn(key => data.delete(key)),
        keys: jest.fn(() => Array.from(data.keys())),
    };
};

const record = game => JSON.stringify({ version: 1, timestamp: 1, path: "/a", game });

const start = (config, initial) => {
    const state = new State();
    const adapter = memoryAdapter(initial);

    state.setStorage(adapter);
    state._start(config);

    return { state, adapter };
};

describe("State restore and autosave", () => {
    let listeners;

    beforeEach(() => {
        jest.useFakeTimers();
        listeners = {};
        global.window = {
            addEventListener: (name, fn) => {
                listeners[name] = fn;
            },
        };
    });

    afterEach(() => {
        jest.useRealTimers();
        delete global.window;
    });

    test("restores game from the persist slot when _start returns", () => {
        const { state } = start(
            { persist: { slot: "autosave" } },
            { "mage:save:autosave": record({ score: 7 }) },
        );

        expect(state.get("game")).toEqual({ score: 7 });
        expect(state.history.canUndo()).toBe(false);
    });

    test("an empty slot leaves game untouched", () => {
        const { state } = start({ persist: { slot: "autosave" } });

        expect(state.get("game")).toEqual({});
    });

    test("an unknown version makes _start throw", () => {
        expect(() =>
            start(
                { persist: { slot: "autosave" } },
                { "mage:save:autosave": JSON.stringify({ version: 2, game: {} }) },
            ),
        ).toThrow(/version/);
    });

    test("restore does not schedule a save", () => {
        const { adapter } = start(
            { persist: { slot: "autosave" } },
            { "mage:save:autosave": record({ score: 7 }) },
        );

        jest.advanceTimersByTime(5000);

        expect(adapter.setItem).not.toHaveBeenCalled();
    });

    test("three game writes within 500 ms produce one save, 500 ms after the last", () => {
        const { state, adapter } = start({ persist: { slot: "autosave" } });

        state.set("game.x", 1);
        jest.advanceTimersByTime(300);
        state.set("game.x", 2);
        jest.advanceTimersByTime(300);
        state.set("game.x", 3);
        jest.advanceTimersByTime(499);

        expect(adapter.setItem).not.toHaveBeenCalled();

        jest.advanceTimersByTime(1);

        expect(adapter.setItem).toHaveBeenCalledTimes(1);
        expect(JSON.parse(adapter.data.get("mage:save:autosave")).game).toEqual({ x: 3 });
    });

    test("level-only writes do not save", () => {
        const { state, adapter } = start({ persist: { slot: "autosave" } });

        state.set("level.y", 1);
        jest.advanceTimersByTime(5000);

        expect(adapter.setItem).not.toHaveBeenCalled();
    });

    test("undo, redo and hydrate that change game schedule a save", () => {
        const { state, adapter } = start({ persist: { slot: "autosave" } });

        state.set("game.x", 1);
        jest.advanceTimersByTime(500);
        adapter.setItem.mockClear();

        state.history.undo();
        jest.advanceTimersByTime(500);
        expect(adapter.setItem).toHaveBeenCalledTimes(1);

        state.history.redo();
        jest.advanceTimersByTime(500);
        expect(adapter.setItem).toHaveBeenCalledTimes(2);

        state.hydrate({ version: 1, game: { z: 1 }, level: {} });
        jest.advanceTimersByTime(500);
        expect(adapter.setItem).toHaveBeenCalledTimes(3);
    });

    test("pagehide writes a pending save immediately, once", () => {
        const { state, adapter } = start({ persist: { slot: "autosave" } });

        state.set("game.x", 1);
        listeners.pagehide();

        expect(adapter.setItem).toHaveBeenCalledTimes(1);

        listeners.pagehide();
        jest.advanceTimersByTime(5000);

        expect(adapter.setItem).toHaveBeenCalledTimes(1);
    });

    test("custom debounceMs is honoured", () => {
        const { state, adapter } = start({ persist: { slot: "autosave", debounceMs: 50 } });

        state.set("game.x", 1);
        jest.advanceTimersByTime(50);

        expect(adapter.setItem).toHaveBeenCalledTimes(1);
    });

    test("errors from an autosave propagate out of the timer", () => {
        const { state, adapter } = start({ persist: { slot: "autosave" } });

        adapter.setItem.mockImplementation(() => {
            throw new Error("quota");
        });
        state.set("game.x", 1);

        expect(() => jest.advanceTimersByTime(500)).toThrow("quota");
    });

    test.each([
        ["unset", {}],
        ["null slot", { persist: { slot: null } }],
    ])("with persist %s no commit ever saves", (_, config) => {
        const { state, adapter } = start(config);

        state.set("game.x", 1);
        jest.advanceTimersByTime(5000);

        expect(adapter.setItem).not.toHaveBeenCalled();
    });
});
