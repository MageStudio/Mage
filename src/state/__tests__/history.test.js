import { State } from "../index";
import { Config } from "../../core/config";

const started = limit => {
    const state = new State();

    state._start({ history: { limit } });

    return state;
};

describe("State history", () => {
    test("is on by default with a limit of 100", () => {
        const state = new State();

        state.set("game.a", 1);
        state.set("game.a", 2);

        expect(state.history.undo()).toBe(true);
        expect(state.get("game.a")).toBe(1);
    });

    test("keeps at most 100 roots by default", () => {
        const state = new State();

        for (let i = 0; i < 150; i++) state.set("game.a", i);

        expect(state.history.entries()).toHaveLength(100);
    });

    test("limit 0 turns history off", () => {
        const state = started(0);

        state.set("game.a", 1);
        state.set("game.a", 2);

        expect(state.history.undo()).toBe(false);
        expect(state.history.redo()).toBe(false);
        expect(state.history.canUndo()).toBe(false);
        expect(state.history.entries()).toEqual([]);
        expect(() => state.history.goTo(1)).toThrow(
            "mage.state.history.goTo: revision 1 is not in history",
        );
        expect(state.get("game.a")).toBe(2);
    });

    describe("with limit 3", () => {
        let state;
        let roots;

        beforeEach(() => {
            state = started(3);
            roots = [];
            for (let i = 1; i <= 4; i++) {
                state.set("game.a", i);
                roots.push(state.get());
            }
        });

        test("entries keeps the last 3, oldest first, one current", () => {
            const entries = state.history.entries();

            expect(entries.map(e => e.revision)).toEqual([2, 3, 4]);
            entries.forEach(entry => {
                expect(Object.keys(entry).sort()).toEqual(
                    ["current", "label", "revision", "timestamp"].sort(),
                );
                expect(typeof entry.timestamp).toBe("number");
            });
            expect(entries.filter(e => e.current)).toHaveLength(1);
            expect(entries[2].current).toBe(true);
            expect(entries[2].label).toBe("set game.a");
        });

        test("undo twice restores the same root and notifies kind undo", () => {
            const kinds = [];

            state.subscribe("game.a", (next, prev, commit) => kinds.push(commit.kind));

            expect(state.history.undo()).toBe(true);
            expect(state.history.undo()).toBe(true);
            expect(state.get()).toBe(roots[1]);
            expect(kinds).toEqual(["undo", "undo"]);
            expect(state.history.canUndo()).toBe(false);
            expect(state.history.undo()).toBe(false);
        });

        test("redo moves forward with kind redo", () => {
            const kinds = [];

            state.history.undo();
            state.history.undo();
            state.subscribe("game.a", (next, prev, commit) => kinds.push(commit.kind));

            expect(state.history.canRedo()).toBe(true);
            expect(state.history.redo()).toBe(true);
            expect(state.get()).toBe(roots[2]);
            expect(kinds).toEqual(["redo"]);
            expect(state.history.redo()).toBe(true);
            expect(state.history.redo()).toBe(false);
        });

        test("a set after an undo discards redo", () => {
            state.history.undo();
            expect(state.history.canRedo()).toBe(true);

            state.set("game.a", 99);

            expect(state.history.canRedo()).toBe(false);
        });

        test("goTo a kept revision makes it current with kind goTo", () => {
            const kinds = [];

            state.subscribe("game.a", (next, prev, commit) => kinds.push(commit.kind));
            state.history.goTo(2);

            expect(state.get()).toBe(roots[1]);
            expect(kinds).toEqual(["goTo"]);
            expect(state.snapshot().revision).toBe(2);
        });

        test("goTo a dropped revision throws", () => {
            expect(() => state.history.goTo(1)).toThrow(
                new Error("mage.state.history.goTo: revision 1 is not in history"),
            );
        });

        test("undo, redo and goTo are not recorded and revision follows the entry", () => {
            state.history.undo();
            expect(state.history.entries()).toHaveLength(3);
            expect(state.snapshot().revision).toBe(3);
            expect(state.history.entries().find(e => e.current).revision).toBe(3);

            state.history.redo();
            state.history.goTo(2);

            expect(state.history.entries()).toHaveLength(3);
            expect(state.snapshot().revision).toBe(2);
            expect(state.history.entries().find(e => e.current).revision).toBe(2);
        });

        test("clear leaves only the current root", () => {
            state.history.undo();
            state.history.clear();

            expect(state.history.entries()).toHaveLength(1);
            expect(state.history.canUndo()).toBe(false);
            expect(state.history.canRedo()).toBe(false);
            expect(state.get("game.a")).toBe(3);
        });

        test("hydrate clears history", () => {
            state.hydrate({ version: 1, game: { b: 1 }, level: {} });

            expect(state.history.canUndo()).toBe(false);
            expect(state.history.canRedo()).toBe(false);
            expect(state.history.entries()).toHaveLength(1);
        });
    });

    test("a batch produces one entry", () => {
        const state = started(10);
        const before = state.history.entries().length;

        state.batch(() => {
            state.set("game.a", 1);
            state.set("game.b", 2);
        });

        expect(state.history.entries()).toHaveLength(before + 1);
        state.history.undo();
        expect(state.get("game")).toEqual({});
    });

    describe("_start", () => {
        test("applies only on its first call", () => {
            const state = new State();

            state._start({ history: { limit: 0 } });
            state._start({ history: { limit: 50 } });
            state.set("game.a", 1);

            expect(state.history.entries()).toEqual([]);
        });

        test("falls back to 100 for missing config", () => {
            const state = new State();

            state._start(undefined);
            for (let i = 0; i < 150; i++) state.set("game.a", i);

            expect(state.history.entries()).toHaveLength(100);
        });

        test("a lower limit trims the oldest entries", () => {
            const state = new State();

            for (let i = 1; i <= 5; i++) state.set("game.a", i);
            state._start({ history: { limit: 2 } });

            expect(state.history.entries().map(e => e.revision)).toEqual([4, 5]);
            expect(state.history.undo()).toBe(true);
            expect(state.get("game.a")).toBe(4);
        });
    });

    test("Config.state() default feeds _start", () => {
        expect(new Config().state()).toEqual({ history: { limit: 100 } });
    });
});
