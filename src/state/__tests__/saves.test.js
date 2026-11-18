jest.mock("../../runner/GameRunner", () => ({ getCurrentPath: jest.fn(() => "/level1") }));

import { State } from "../index";

const memoryAdapter = () => {
    const data = new Map();

    return {
        data,
        getItem: jest.fn(key => (data.has(key) ? data.get(key) : null)),
        setItem: jest.fn((key, value) => data.set(key, value)),
        removeItem: jest.fn(key => data.delete(key)),
        keys: jest.fn(() => Array.from(data.keys())),
    };
};

const createState = () => {
    const state = new State();
    const adapter = memoryAdapter();

    state.setStorage(adapter);

    return { state, adapter };
};

describe("State saves", () => {
    afterEach(() => {
        delete global.window;
        jest.restoreAllMocks();
    });

    test("save writes the versioned record under mage:save:<slot> and returns it", () => {
        const { state, adapter } = createState();

        state.set("game.score", 3);

        const record = state.save("slot1");

        expect(Object.keys(JSON.parse(adapter.data.get("mage:save:slot1")))).toEqual([
            "version",
            "timestamp",
            "path",
            "game",
        ]);
        expect(JSON.parse(adapter.data.get("mage:save:slot1"))).toEqual(record);
        expect(record).toMatchObject({ version: 1, path: "/level1", game: { score: 3 } });
        expect(typeof record.timestamp).toBe("number");
    });

    test("save() uses the default slot", () => {
        const { state, adapter } = createState();

        state.save();

        expect(adapter.data.has("mage:save:default")).toBe(true);
    });

    test("load restores game, empties level, clears history and does not change level", () => {
        const GameRunner = require("../../runner/GameRunner");
        const { state } = createState();

        state.set("game.score", 3);
        state.save("slot1");
        state.set("game.score", 9);
        state.set("level.y", 1);

        const result = state.load("slot1");

        expect(state.get("game")).toEqual({ score: 3 });
        expect(state.get("level")).toEqual({});
        expect(state.history.canUndo()).toBe(false);
        expect(result).toEqual({ path: "/level1", timestamp: expect.any(Number) });
        expect(Object.keys(GameRunner)).toEqual(["getCurrentPath"]);
    });

    test("load of an empty slot returns null and leaves state alone", () => {
        const { state } = createState();

        state.set("game.score", 3);

        expect(state.load("empty")).toBeNull();
        expect(state.get("game.score")).toBe(3);
    });

    test("load throws on an unknown version", () => {
        const { state, adapter } = createState();

        adapter.data.set("mage:save:x", JSON.stringify({ version: 2, game: {} }));

        expect(() => state.load("x")).toThrow(/version/);
    });

    test("listSaves returns saves newest first, ignoring other keys and corrupt records", () => {
        const { state, adapter } = createState();

        adapter.data.set("other", "{}");
        adapter.data.set("mage:save:bad", "not json");
        adapter.data.set(
            "mage:save:old",
            JSON.stringify({ version: 1, timestamp: 1, path: "/a", game: {} }),
        );
        adapter.data.set(
            "mage:save:new",
            JSON.stringify({ version: 1, timestamp: 5, path: "/b", game: {} }),
        );

        expect(state.listSaves()).toEqual([
            { slot: "new", path: "/b", timestamp: 5 },
            { slot: "old", path: "/a", timestamp: 1 },
        ]);
    });

    test("deleteSave removes the key", () => {
        const { state, adapter } = createState();

        state.save("a");
        state.deleteSave("a");

        expect(adapter.data.has("mage:save:a")).toBe(false);
    });

    test("default adapter without localStorage throws from save and load", () => {
        const state = new State();
        const message = "mage.state.save: localStorage is not available";

        expect(() => state.save()).toThrow(new Error(message));
        expect(() => state.load()).toThrow(new Error(message));
    });

    test("save rethrows the error thrown by setItem", () => {
        const { state, adapter } = createState();
        const error = new Error("quota");

        adapter.setItem.mockImplementation(() => {
            throw error;
        });

        expect(() => state.save()).toThrow(error);
    });

    test("default adapter wraps window.localStorage", () => {
        const store = new Map();

        global.window = {
            localStorage: {
                get length() {
                    return store.size;
                },
                key: i => Array.from(store.keys())[i],
                getItem: k => (store.has(k) ? store.get(k) : null),
                setItem: (k, v) => store.set(k, v),
                removeItem: k => store.delete(k),
            },
        };

        const state = new State();

        state.set("game.a", 1);
        state.save("s");

        expect(store.has("mage:save:s")).toBe(true);
        expect(state.listSaves().map(s => s.slot)).toEqual(["s"]);
        expect(state.load("s")).not.toBeNull();
    });

    test("setStorage routes everything to the adapter, not localStorage", () => {
        const localStorage = {
            length: 0,
            key: jest.fn(),
            getItem: jest.fn(),
            setItem: jest.fn(),
            removeItem: jest.fn(),
        };

        global.window = { localStorage };

        const { state } = createState();

        state.save("a");
        state.load("a");
        state.listSaves();
        state.deleteSave("a");

        Object.values(localStorage).forEach(fn => {
            if (jest.isMockFunction(fn)) expect(fn).not.toHaveBeenCalled();
        });
    });

    test("setStorage throws a TypeError naming the first missing method", () => {
        const state = new State();

        expect(() => state.setStorage({ getItem() {} })).toThrow(TypeError);
        expect(() => state.setStorage({ getItem() {} })).toThrow(/setItem/);
    });
});
