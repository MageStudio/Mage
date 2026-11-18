import { State } from "../index";

describe("State subscriptions", () => {
    let state;

    beforeEach(() => {
        state = new State();
    });

    test("subscriber to a parent path is called once with (next, prev, commit)", () => {
        state.set("game.player.health", 3);
        const player = jest.fn();
        const score = jest.fn();
        state.subscribe("game.player", player);
        state.subscribe("game.score", score);

        state.set("game.player.health", 2);

        expect(player).toHaveBeenCalledTimes(1);
        const [next, prev, commit] = player.mock.calls[0];
        expect(next).toEqual({ health: 2 });
        expect(prev).toEqual({ health: 3 });
        expect(commit.changes[0].path).toBe("game.player.health");
        expect(score).not.toHaveBeenCalled();
    });

    test("setting the same reference calls no subscriber", () => {
        state.set("game.score", 1);
        const cb = jest.fn();
        state.subscribe("game", cb);

        state.set("game.score", 1);

        expect(cb).not.toHaveBeenCalled();
        expect(state.snapshot().revision).toBe(1);
    });

    test("subscribers run in subscription order", () => {
        const order = [];
        state.subscribe("game", () => order.push(1));
        state.subscribe("game", () => order.push(2));

        state.set("game.a", 1);

        expect(order).toEqual([1, 2]);
    });

    test("unsubscribing during a pass doesn't skip or crash others", () => {
        const calls = [];
        let off2;
        state.subscribe("game", () => {
            calls.push("a");
            off2();
        });
        off2 = state.subscribe("game", () => calls.push("b"));
        state.subscribe("game", () => calls.push("c"));

        state.set("game.x", 1);

        expect(calls).toEqual(["a", "c"]);
    });

    describe("batch", () => {
        test("one commit, one notification, one revision", () => {
            const cb = jest.fn();
            state.subscribe("game", cb);

            state.batch(() => {
                state.set("game.a", 1);
                state.set("game.b", 2);
            });

            expect(cb).toHaveBeenCalledTimes(1);
            const commit = cb.mock.calls[0][2];
            expect(commit.label).toBe("batch");
            expect(commit.changes.map(c => c.path)).toEqual(["game.a", "game.b"]);
            expect(state.snapshot().revision).toBe(1);
        });

        test("get inside a batch sees the in-progress root so update composes", () => {
            state.batch(() => {
                state.set("game.n", 1);
                state.update("game.n", v => v + 1);
                expect(state.get("game.n")).toBe(2);
            });

            expect(state.get("game.n")).toBe(2);
        });

        test("nested batches fold into one commit and label is overridable", () => {
            const cb = jest.fn();
            state.subscribe("game", cb);

            state.batch(
                () => {
                    state.set("game.a", 1);
                    state.batch(() => state.set("game.b", 2));
                },
                { label: "setup" },
            );

            expect(cb).toHaveBeenCalledTimes(1);
            expect(cb.mock.calls[0][2].label).toBe("setup");
            expect(state.snapshot().revision).toBe(1);
        });

        test("a throwing batch restores the root, notifies nobody and rethrows", () => {
            state.set("game.a", 1);
            const before = state.get();
            const cb = jest.fn();
            state.subscribe("game", cb);

            expect(() =>
                state.batch(() => {
                    state.set("game.b", 2);
                    throw new Error("boom");
                }),
            ).toThrow("boom");

            expect(state.get()).toBe(before);
            expect(cb).not.toHaveBeenCalled();
            expect(state.snapshot().revision).toBe(1);

            state.set("game.c", 3);
            expect(cb).toHaveBeenCalledTimes(1);
        });

        test("a caught inner throw rolls back only the inner batch", () => {
            const cb = jest.fn();
            state.subscribe("game", cb);

            state.batch(() => {
                state.set("game.a", 1);
                try {
                    state.batch(() => {
                        state.set("game.b", 2);
                        throw new Error("inner");
                    });
                } catch {
                    // swallowed on purpose
                }
                state.set("game.c", 3);
            });

            expect(state.get("game")).toEqual({ a: 1, c: 3 });
            expect(cb).toHaveBeenCalledTimes(1);
            expect(cb.mock.calls[0][2].changes.map(c => c.path)).toEqual(["game.a", "game.c"]);
            expect(state.snapshot().revision).toBe(1);
        });

        test("a batch that changes nothing commits nothing", () => {
            const cb = jest.fn();
            const before = state.get();
            state.subscribe("game", cb);

            state.batch(() => {
                state.remove("game.zzz");
            });
            state.batch(() => {});

            expect(cb).not.toHaveBeenCalled();
            expect(state.get()).toBe(before);
            expect(state.snapshot().revision).toBe(0);
        });
    });

    describe("chained commits", () => {
        test("a write from a subscriber is notified after the first pass finishes", () => {
            const log = [];
            state.subscribe("game.a", () => {
                log.push("a1");
                state.set("game.b", 1);
                log.push("a2");
            });
            state.subscribe("game.a", () => log.push("a-second"));
            state.subscribe("game.b", () => log.push("b"));

            state.set("game.a", 1);

            expect(log).toEqual(["a1", "a2", "a-second", "b"]);
        });

        test("more than 100 chained commits throws", () => {
            state.set("game.n", 0);
            state.subscribe("game.n", next => state.set("game.n", next + 1));

            expect(() => state.set("game.n", 1)).toThrow(
                "mage.state: more than 100 chained commits, a subscriber is probably writing the value it listens to",
            );
        });

        test("the chain counter restarts for the next top-level write", () => {
            state.set("game.n", 0);
            const off = state.subscribe("game.n", next => {
                if (next % 80 !== 0) state.set("game.n", next + 1);
            });

            state.set("game.n", 1);
            expect(state.get("game.n")).toBe(80);
            state.set("game.n", 81);
            expect(state.get("game.n")).toBe(160);
            off();
        });
    });

    describe("subscriber errors", () => {
        test("others still run, the first error is rethrown and the value is kept", () => {
            const second = jest.fn();
            state.subscribe("game.a", () => {
                throw new Error("first");
            });
            state.subscribe("game.a", () => {
                throw new Error("second");
            });
            state.subscribe("game.a", second);

            expect(() => state.set("game.a", 1)).toThrow("first");

            expect(second).toHaveBeenCalledTimes(1);
            expect(state.get("game.a")).toBe(1);
        });

        test("subscribe validates its arguments", () => {
            expect(() => state.subscribe("game.a", "nope")).toThrow(TypeError);
            expect(() => state.subscribe("nope", () => {})).toThrow('"game" or "level"');
        });
    });

    describe("level-owned subscriptions", () => {
        test("_endLevel removes only subscriptions made after _beginLevel", () => {
            const outside = jest.fn();
            const inside = jest.fn();
            state.subscribe("game.a", outside);
            state._beginLevel();
            const off = state.subscribe("game.a", inside);
            state._endLevel();

            state.set("game.a", 1);

            expect(outside).toHaveBeenCalledTimes(1);
            expect(inside).not.toHaveBeenCalled();
            expect(() => {
                off();
                off();
            }).not.toThrow();
        });

        test("subscriptions after _endLevel are not level-owned", () => {
            state._beginLevel();
            state._endLevel();
            const cb = jest.fn();
            state.subscribe("game.a", cb);
            state._beginLevel();
            state._endLevel();

            state.set("game.a", 1);

            expect(cb).toHaveBeenCalledTimes(1);
        });

        test("unsubscribe twice is safe", () => {
            const off = state.subscribe("game.a", () => {});

            off();

            expect(() => off()).not.toThrow();
        });
    });
});
