import { parsePath, pathToString, getIn, setIn, removeIn } from "../paths";
import { validateAndFreeze } from "../validate";

const build = (game = {}, level = {}) => ({
    game: validateAndFreeze(game, "game", "set"),
    level: validateAndFreeze(level, "level", "set"),
});

describe("parsePath", () => {
    test("splits a dotted string", () => {
        expect(parsePath("game.player.health")).toEqual(["game", "player", "health"]);
    });

    test("keeps dotted segments of an array path intact", () => {
        expect(parsePath(["game", "highscores", "v1.2"])).toEqual(["game", "highscores", "v1.2"]);
    });

    test("accepts a bare scope", () => {
        expect(parsePath("level")).toEqual(["level"]);
    });

    test("returns a copy of an array path", () => {
        const input = ["game", "a"];
        expect(parsePath(input)).not.toBe(input);
    });

    test("throws the exact message for a bad first segment", () => {
        expect(() => parsePath("player.health")).toThrow(
            new Error('mage.state: path must start with "game" or "level" (got "player.health")'),
        );
    });

    test("names the joined path for a bad array path", () => {
        expect(() => parsePath(["player", "health"])).toThrow(
            'mage.state: path must start with "game" or "level" (got "player.health")',
        );
    });

    test.each([[""], [[]]])("throws on empty path %p", path => {
        expect(() => parsePath(path)).toThrow("mage.state: path must not be empty");
    });

    test.each([["game..x"], ["game."], [["game", "", "x"]]])("throws on empty segment %p", path => {
        expect(() => parsePath(path)).toThrow("mage.state: path must not contain empty segments");
    });

    test("throws on a non string/array path", () => {
        expect(() => parsePath(42)).toThrow(TypeError);
        expect(() => parsePath(undefined)).toThrow(TypeError);
    });
});

describe("getIn", () => {
    const root = build({ player: { health: 3, items: ["a", "b"] }, "v1.2": 1 });

    test("reads nested values", () => {
        expect(getIn(root, ["game", "player", "health"])).toBe(3);
        expect(getIn(root, ["game", "v1.2"])).toBe(1);
    });

    test("reads array indexes", () => {
        expect(getIn(root, ["game", "player", "items", "1"])).toBe("b");
    });

    test("returns undefined for missing paths and through primitives", () => {
        expect(getIn(root, ["game", "nope", "x"])).toBeUndefined();
        expect(getIn(root, ["game", "player", "health", "x"])).toBeUndefined();
        expect(getIn(root, ["game", "player", "items", "9"])).toBeUndefined();
    });

    test("does not read inherited properties", () => {
        expect(getIn(root, ["game", "constructor"])).toBeUndefined();
        expect(getIn(root, ["game", "player", "items", "length"])).toBeUndefined();
    });
});

describe("setIn", () => {
    test("shares every untouched branch", () => {
        const root = build({ a: { x: 1 }, b: { y: 2 } }, { z: { w: 1 } });
        const next = setIn(root, ["game", "a", "x"], 5);
        expect(next).not.toBe(root);
        expect(next.game.a.x).toBe(5);
        expect(next.game.b).toBe(root.game.b);
        expect(next.level).toBe(root.level);
        expect(root.game.a.x).toBe(1);
    });

    test("creates missing intermediates as {}", () => {
        const next = setIn(build(), ["game", "a", "b", "c"], 1);
        expect(next.game).toEqual({ a: { b: { c: 1 } } });
        expect(Object.getPrototypeOf(next.game.a.b)).toBe(Object.prototype);
    });

    test("freezes every new container and the written value", () => {
        const next = setIn(build(), ["game", "a", "b"], { list: [{ n: 1 }] });
        const frozen = [
            next,
            next.game,
            next.game.a,
            next.game.a.b,
            next.game.a.b.list,
            next.game.a.b.list[0],
        ];
        frozen.forEach(o => expect(Object.isFrozen(o)).toBe(true));
    });

    test("assigning to a stored object throws a TypeError", () => {
        const next = setIn(build(), ["game", "p"], { health: 1, tags: [1] });
        expect(() => {
            next.game.p.health = 2;
        }).toThrow(TypeError);
        expect(() => {
            next.game.p.tags.push(2);
        }).toThrow(TypeError);
        expect(() => {
            next.game.p.extra = 2;
        }).toThrow(TypeError);
    });

    test("does not freeze the caller's own object", () => {
        const input = { a: 1 };
        setIn(build(), ["game", "x"], input);
        expect(Object.isFrozen(input)).toBe(false);
    });

    test("writing through a primitive throws the exact message", () => {
        const root = build({ score: 3 });
        expect(() => setIn(root, ["game", "score", "best"], 5)).toThrow(
            new Error('mage.state.set: "game.score" is a number, can\'t set "best" on it'),
        );
    });

    test.each([
        ["string", "hi"],
        ["boolean", true],
        ["null", null],
    ])("names the found type for %s", (name, value) => {
        const root = build({ v: value });
        expect(() => setIn(root, ["game", "v", "x"], 1)).toThrow(
            `mage.state.set: "game.v" is ${name === "null" ? "null" : `a ${name}`}, can't set "x" on it`,
        );
    });

    test("uses the method name in errors", () => {
        const root = build({ score: 3 });
        expect(() => setIn(root, ["game", "score", "best"], 5, "update")).toThrow(
            'mage.state.update: "game.score" is a number',
        );
    });

    test("an invalid value throws a TypeError naming the full path", () => {
        expect(() => setIn(build(), ["game", "player", "weapon"], new Map(), "set")).toThrow(
            new TypeError(
                'mage.state.set: value at "game.player.weapon" is not JSON-safe (found Map)',
            ),
        );
    });

    test("numeric segment writes an array index", () => {
        const root = build({ list: ["a", "b"] });
        const next = setIn(root, ["game", "list", "1"], "z");
        expect(next.game.list).toEqual(["a", "z"]);
        expect(Array.isArray(next.game.list)).toBe(true);
        expect(Object.isFrozen(next.game.list)).toBe(true);
        expect(root.game.list).toEqual(["a", "b"]);
    });

    test("index equal to length appends", () => {
        const next = setIn(build({ list: ["a"] }), ["game", "list", "1"], "b");
        expect(next.game.list).toEqual(["a", "b"]);
    });

    test("index greater than length throws", () => {
        expect(() => setIn(build({ list: ["a"] }), ["game", "list", "2"], "b")).toThrow(
            'mage.state.set: index 2 is past the end of "game.list" (length 1)',
        );
    });

    test("non-index segment on an array throws", () => {
        expect(() => setIn(build({ list: [1] }), ["game", "list", "x"], 1)).toThrow(
            'mage.state.set: "game.list" is an array, can\'t set "x" on it',
        );
    });

    test("writes through an array element", () => {
        const root = build({ list: [{ n: 1 }, { n: 2 }] });
        const next = setIn(root, ["game", "list", "1", "n"], 9);
        expect(next.game.list[1].n).toBe(9);
        expect(next.game.list[0]).toBe(root.game.list[0]);
    });

    test("numeric segment on an object is an ordinary key", () => {
        const next = setIn(build({ o: {} }), ["game", "o", "5"], "x");
        expect(Array.isArray(next.game.o)).toBe(false);
        expect(next.game.o).toEqual({ 5: "x" });
    });

    test("writing the same reference returns the same root", () => {
        const root = build({ a: { b: 1 } });
        expect(setIn(root, ["game", "a"], root.game.a)).toBe(root);
        expect(setIn(root, ["game", "a", "b"], 1)).toBe(root);
    });

    test("writing a store value elsewhere reuses it without copying", () => {
        const root = build({ a: { b: 1 } });
        const next = setIn(root, ["game", "copy"], root.game.a);
        expect(next.game.copy).toBe(root.game.a);
    });

    test("a key named __proto__ is an own key, not a prototype change", () => {
        const next = setIn(build(), ["game", "__proto__", "polluted"], 1);
        expect(Object.getPrototypeOf(next.game)).toBe(Object.prototype);
        expect(Object.prototype.hasOwnProperty.call(next.game, "__proto__")).toBe(true);
        expect({}.polluted).toBeUndefined();
        expect(getIn(next, ["game", "__proto__", "polluted"])).toBe(1);
    });

    test("never touches untouched branches", () => {
        const traps = { ownKeys: jest.fn(), get: jest.fn(), getPrototypeOf: jest.fn() };
        const big = new Proxy(
            {},
            {
                ownKeys: (...a) => (traps.ownKeys(...a), Reflect.ownKeys(...a)),
                get: (...a) => (traps.get(...a), Reflect.get(...a)),
                getPrototypeOf: (...a) => (
                    traps.getPrototypeOf(...a),
                    Reflect.getPrototypeOf(...a)
                ),
            },
        );
        const root = {
            game: Object.freeze({ big, small: Object.freeze({ n: 1 }) }),
            level: Object.freeze({}),
        };
        const next = setIn(root, ["game", "small", "n"], 2);
        expect(next.game.big).toBe(big);
        expect(traps.ownKeys).not.toHaveBeenCalled();
        expect(traps.get).not.toHaveBeenCalled();
        expect(traps.getPrototypeOf).not.toHaveBeenCalled();
        const removed = removeIn(root, ["game", "small"]);
        expect(removed.game.big).toBe(big);
        expect(traps.ownKeys).not.toHaveBeenCalled();
    });
});

describe("removeIn", () => {
    test("deletes an object key and shares siblings", () => {
        const root = build({ a: 1, b: { c: 2 } });
        const next = removeIn(root, ["game", "a"]);
        expect(next.game).toEqual({ b: { c: 2 } });
        expect(next.game.b).toBe(root.game.b);
        expect(Object.isFrozen(next.game)).toBe(true);
        expect(root.game.a).toBe(1);
    });

    test("splices an array index", () => {
        const root = build({ list: ["a", "b", "c"] });
        const next = removeIn(root, ["game", "list", "1"]);
        expect(next.game.list).toEqual(["a", "c"]);
        expect(Array.isArray(next.game.list)).toBe(true);
        expect(Object.isFrozen(next.game.list)).toBe(true);
    });

    test("removes nested keys", () => {
        const next = removeIn(build({ a: { b: { c: 1, d: 2 } } }), ["game", "a", "b", "c"]);
        expect(next.game.a.b).toEqual({ d: 2 });
    });

    test.each([
        [["game", "nope"]],
        [["game", "a", "b", "c"]],
        [["game", "a", "x"]],
        [["game", "list", "5"]],
        [["game", "list", "x"]],
        [["game", "list", "length"]],
        [["game", "constructor"]],
    ])("returns the same root for missing path %p", segments => {
        const root = build({ a: 1, list: [1] });
        expect(removeIn(root, segments)).toBe(root);
    });

    test("removing a scope itself throws", () => {
        expect(() => removeIn(build(), ["game"])).toThrow(
            'mage.state.remove: can\'t remove "game"',
        );
        expect(() => removeIn(build(), ["level"], "remove")).toThrow(
            'mage.state.remove: can\'t remove "level"',
        );
    });
});

describe("pathToString", () => {
    test("joins segments with dots", () => {
        expect(pathToString(["game", "a", "b"])).toBe("game.a.b");
    });
});
