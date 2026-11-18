jest.mock("../../runner/GameRunner", () => ({ getCurrentPath: jest.fn(() => "/level1") }));

import { State } from "../index";

class Weapon {}

describe("State core", () => {
    let state;

    beforeEach(() => {
        state = new State();
    });

    test("starts with frozen empty game and level and revision 0", () => {
        expect(state.get()).toEqual({ game: {}, level: {} });
        expect(Object.isFrozen(state.get())).toBe(true);
        expect(Object.isFrozen(state.get("game"))).toBe(true);
        expect(state.snapshot()).toEqual({ version: 1, revision: 0, game: {}, level: {} });
    });

    test("set creates intermediate objects", () => {
        state.set("game.player.health", 3);

        expect(state.get("game.player.health")).toBe(3);
        expect(state.get("game.player")).toEqual({ health: 3 });
        expect(state.get("game.nothing.here")).toBeUndefined();
    });

    test("accepts array paths", () => {
        state.set(["game", "scores", "v1.2"], 7);

        expect(state.get(["game", "scores", "v1.2"])).toBe(7);
    });

    test("rejects bad paths", () => {
        expect(() => state.set("player.health", 3)).toThrow('"game" or "level"');
        expect(() => state.set("game..x", 1)).toThrow();
        expect(() => state.set("", 1)).toThrow();
        expect(() => state.get("nope")).toThrow('"game" or "level"');
    });

    test("scope roots must stay plain objects", () => {
        expect(() => state.set("game", 5)).toThrow(TypeError);
        expect(() => state.set("level", [])).toThrow(TypeError);
        expect(() => state.set("game", null)).toThrow(TypeError);

        state.set("game", { a: 1 });
        expect(state.get("game.a")).toBe(1);
    });

    test.each([
        ["undefined", undefined],
        ["NaN", NaN],
        ["Infinity", Infinity],
        ["function", () => {}],
        ["class instance", new Weapon()],
        ["Map", new Map()],
        ["Date", new Date()],
    ])("set throws TypeError for %s and keeps the root", (name, value) => {
        state.set("game.a", 1);
        const before = state.get();

        expect(() => state.set("game.player.weapon", value)).toThrow(TypeError);
        expect(() => state.set("game.player.weapon", value)).toThrow("game.player.weapon");
        expect(state.get()).toBe(before);
    });

    test("set throws for a cycle and keeps the root", () => {
        const before = state.get();
        const a = {};
        a.self = a;

        expect(() => state.set("game.a", a)).toThrow(TypeError);
        expect(state.get()).toBe(before);
    });

    test("writing through a primitive throws and keeps the root", () => {
        state.set("game.score", 3);
        const before = state.get();

        expect(() => state.set("game.score.best", 5)).toThrow(
            'mage.state.set: "game.score" is a number, can\'t set "best" on it',
        );
        expect(state.get()).toBe(before);
    });

    test("untouched branches keep their reference", () => {
        state.set("game.player.health", 3);
        const player = state.get("game.player");

        state.set("game.score", 1);

        expect(state.get("game.player")).toBe(player);
    });

    test("values returned by get can't be mutated", () => {
        state.set("game.player.health", 3);

        expect(() => {
            state.get("game.player").health = 100;
        }).toThrow(TypeError);
        expect(state.get("game.player.health")).toBe(3);
    });

    test("array indexes", () => {
        state.set("game.items", ["a", "b"]);
        state.set("game.items.1", "c");
        state.set("game.items.2", "d");

        expect(state.get("game.items")).toEqual(["a", "c", "d"]);
        expect(() => state.set("game.items.9", "x")).toThrow();
        expect(state.get("game.items")).toEqual(["a", "c", "d"]);
    });

    describe("update", () => {
        test("passes the current frozen value, possibly undefined", () => {
            const seen = [];
            state.update("game.n", v => {
                seen.push(v);
                return 1;
            });
            state.set("game.o", { a: 1 });
            state.update("game.o", v => {
                seen.push(v);
                return { a: v.a + 1 };
            });

            expect(seen[0]).toBeUndefined();
            expect(Object.isFrozen(seen[1])).toBe(true);
            expect(state.get("game.o.a")).toBe(2);
        });
    });

    describe("remove", () => {
        test("deletes keys and splices array indexes", () => {
            state.set("game.a", { b: 1, c: 2 });
            state.set("game.list", [1, 2, 3]);

            state.remove("game.a.b");
            state.remove("game.list.1");

            expect(state.get("game.a")).toEqual({ c: 2 });
            expect(state.get("game.list")).toEqual([1, 3]);
        });

        test("removing a missing path commits nothing", () => {
            const before = state.get();

            state.remove("game.nothing.here");

            expect(state.get()).toBe(before);
            expect(state.snapshot().revision).toBe(0);
        });

        test("can't remove a scope", () => {
            expect(() => state.remove("game")).toThrow();
            expect(() => state.remove("level")).toThrow();
        });
    });

    describe("setDefault", () => {
        test("sets on empty, keeps existing, returns the value at the path", () => {
            expect(state.setDefault("game.lives", 3)).toBe(3);
            expect(state.get("game.lives")).toBe(3);

            state.set("game.lives", 1);

            expect(state.setDefault("game.lives", 3)).toBe(1);
            expect(state.get("game.lives")).toBe(1);
        });
    });

    describe("commits", () => {
        const capture = (s, path = "game") => {
            const commits = [];
            s.subscribe(path, (next, prev, commit) => commits.push(commit));

            return commits;
        };

        test("shape, default labels and overridable label", () => {
            const commits = capture(state);

            state.set("game.score", 1);
            state.update("game.score", v => v + 1);
            state.setDefault("game.lives", 3);
            state.remove("game.score");
            state.set("game.x", 1, { label: "custom" });

            expect(commits.map(c => c.label)).toEqual([
                "set game.score",
                "update game.score",
                "setDefault game.lives",
                "remove game.score",
                "custom",
            ]);
            expect(commits[0]).toEqual({
                revision: 1,
                label: "set game.score",
                timestamp: expect.any(Number),
                kind: "write",
                changes: [{ path: "game.score", prev: undefined, next: 1 }],
            });
            expect(commits.map(c => c.revision)).toEqual([1, 2, 3, 4, 5]);
        });

        test("setting the same reference commits nothing", () => {
            const commits = capture(state);

            state.set("game.score", 1);
            state.set("game.score", 1);
            state.set("game.o", { a: 1 });
            state.set("game.o", state.get("game.o"));

            expect(commits).toHaveLength(2);
            expect(state.snapshot().revision).toBe(2);
        });
    });

    describe("snapshot and hydrate", () => {
        test("round trips as one hydrate commit", () => {
            state.set("game.player", { health: 3, items: ["a", "b"] });
            state.set("level.door", true);
            const snap = JSON.parse(JSON.stringify(state.snapshot()));
            const other = new State();
            const commits = [];
            other.subscribe("game", (n, p, c) => commits.push(c));
            const revision = other.snapshot().revision;

            other.hydrate(snap);

            expect(other.get()).toEqual(state.get());
            expect(commits).toHaveLength(1);
            expect(commits[0].label).toBe("hydrate");
            expect(commits[0].kind).toBe("hydrate");
            expect(other.snapshot().revision).toBe(revision + 1);
        });

        test("rejects other versions", () => {
            expect(() => state.hydrate({ version: 2, game: {}, level: {} })).toThrow();
            expect(() => state.hydrate(null)).toThrow();
        });

        test("validates values like set and leaves the root", () => {
            const before = state.get();

            expect(() => state.hydrate({ version: 1, game: { a: NaN }, level: {} })).toThrow(
                TypeError,
            );
            expect(() => state.hydrate({ version: 1, game: [], level: {} })).toThrow(TypeError);
            expect(state.get()).toBe(before);
        });
    });

    describe("_resetLevel", () => {
        test("commits level = {} with kind levelReset and keeps game", () => {
            state.set("game.a", 1);
            state.set("level.b", 2);
            const game = state.get("game");
            const commits = [];
            state.subscribe("level", (n, p, c) => commits.push(c));
            const gameCalls = jest.fn();
            state.subscribe("game", gameCalls);

            state._resetLevel();

            expect(state.get("level")).toEqual({});
            expect(state.get("game")).toBe(game);
            expect(commits).toHaveLength(1);
            expect(commits[0].kind).toBe("levelReset");
            expect(gameCalls).not.toHaveBeenCalled();
        });
    });
});
