jest.mock("between.js", () => {
    const mockTween = {
        time: jest.fn(() => mockTween),
        easing: jest.fn(() => mockTween),
        on: jest.fn((event, cb) => {
            mockTween._listeners = mockTween._listeners || {};
            mockTween._listeners[event] = cb;
            return mockTween;
        }),
        loop: jest.fn(() => mockTween),
    };

    const Between = jest.fn(() => mockTween);
    Between.Easing = {
        Linear: { None: "linear-none" },
        Quadratic: { In: "quad-in", Out: "quad-out" },
    };
    Between._mockTween = mockTween;

    return { __esModule: true, default: Between };
});

import {
    LOOPING,
    EASING_EVENTS,
    FUNCTIONS,
    tweenTo,
    pauseAllTweens,
    resumeAllTweens,
    clearAllTweens,
} from "../easing";

describe("easing.js", () => {
    describe("LOOPING", () => {
        test("BOUNCE is 'bounce'", () => {
            expect(LOOPING.BOUNCE).toBe("bounce");
        });

        test("REPEAT is 'repeat'", () => {
            expect(LOOPING.REPEAT).toBe("repeat");
        });

        test("NONE is false", () => {
            expect(LOOPING.NONE).toBe(false);
        });
    });

    describe("EASING_EVENTS", () => {
        test("UPDATE is 'update'", () => {
            expect(EASING_EVENTS.UPDATE).toBe("update");
        });

        test("COMPLETE is 'complete'", () => {
            expect(EASING_EVENTS.COMPLETE).toBe("complete");
        });
    });

    describe("FUNCTIONS", () => {
        test("spreads between.js Easing functions", () => {
            expect(FUNCTIONS.Linear).toBeDefined();
            expect(FUNCTIONS.Linear.None).toBe("linear-none");
        });

        test("has Quadratic easing", () => {
            expect(FUNCTIONS.Quadratic).toBeDefined();
            expect(FUNCTIONS.Quadratic.In).toBe("quad-in");
        });
    });

    describe("tweenTo", () => {
        let Between;
        let mockTween;

        beforeEach(() => {
            Between = require("between.js").default;
            mockTween = Between._mockTween;
            jest.clearAllMocks();
            // Re-setup mock chain
            mockTween.time.mockReturnValue(mockTween);
            mockTween.easing.mockReturnValue(mockTween);
            mockTween.on.mockImplementation((event, cb) => {
                mockTween._listeners = mockTween._listeners || {};
                mockTween._listeners[event] = cb;
                return mockTween;
            });
            mockTween.loop.mockReturnValue(mockTween);
        });

        test("returns a Promise", () => {
            const result = tweenTo(0, 1, { time: 100 });
            expect(result).toBeInstanceOf(Promise);
        });

        test("creates a tween with origin and target", () => {
            tweenTo(0, 100, { time: 500 });
            expect(Between).toHaveBeenCalledWith(0, 100);
        });

        test("sets time on tween", () => {
            tweenTo(0, 1, { time: 1000 });
            expect(mockTween.time).toHaveBeenCalledWith(1000);
        });

        test("sets default easing when not provided", () => {
            tweenTo(0, 1, { time: 100 });
            expect(mockTween.easing).toHaveBeenCalledWith(FUNCTIONS.Linear.None);
        });

        test("sets custom easing", () => {
            tweenTo(0, 1, { time: 100, easing: "quad-in" });
            expect(mockTween.easing).toHaveBeenCalledWith("quad-in");
        });

        test("registers update callback", () => {
            const onUpdate = jest.fn();
            tweenTo(0, 1, { time: 100, onUpdate });
            expect(mockTween.on).toHaveBeenCalledWith(EASING_EVENTS.UPDATE, onUpdate);
        });

        test("resolves on complete for non-looping tween", async () => {
            const promise = tweenTo(0, 1, { time: 100 });
            // Trigger complete callback
            const completeCallback = mockTween._listeners[EASING_EVENTS.COMPLETE];
            completeCallback();
            await expect(promise).resolves.toBeDefined();
        });

        test("calls loop when loop option is set", () => {
            tweenTo(0, 1, { time: 100, loop: LOOPING.BOUNCE, repeat: 3 });
            expect(mockTween.loop).toHaveBeenCalledWith(LOOPING.BOUNCE, 3);
        });

        test("resolves via setTimeout for infinite loops", () => {
            jest.useFakeTimers();
            const promise = tweenTo(0, 1, { time: 100, loop: LOOPING.BOUNCE });
            expect(mockTween.loop).toHaveBeenCalledWith(LOOPING.BOUNCE, undefined);
            jest.advanceTimersByTime(200);
            jest.useRealTimers();
            return expect(promise).resolves.toBeDefined();
        });
    });
    describe("tween registry", () => {
        let Between;
        let created;

        // The shared mock returns one object for every `new between()`, so build a fresh
        // chainable tween per call to be able to tell tweens apart.
        const makeTween = () => {
            const tween = { _listeners: {}, _paused: false };
            tween.time = jest.fn(() => tween);
            tween.easing = jest.fn(() => tween);
            tween.loop = jest.fn(() => tween);
            tween.on = jest.fn((event, cb) => {
                tween._listeners[event] = cb;
                return tween;
            });
            tween.pause = jest.fn(() => {
                tween._paused = true;
                return tween;
            });
            tween.play = jest.fn(() => {
                tween._paused = false;
                return tween;
            });
            return tween;
        };

        beforeEach(() => {
            Between = require("between.js").default;
            clearAllTweens();
            created = [];
            Between.mockReset();
            Between.mockImplementation(() => {
                const tween = makeTween();
                created.push(tween);
                return tween;
            });
        });

        test("pauseAllTweens pauses every live tween", () => {
            tweenTo(0, 1, { time: 100 });
            tweenTo(0, 1, { time: 100 });

            pauseAllTweens();

            expect(created).toHaveLength(2);
            created.forEach(tween => expect(tween.pause).toHaveBeenCalledTimes(1));
        });

        test("resumeAllTweens plays every live tween", () => {
            tweenTo(0, 1, { time: 100 });
            tweenTo(0, 1, { time: 100 });
            pauseAllTweens();

            resumeAllTweens();

            created.forEach(tween => expect(tween.play).toHaveBeenCalledTimes(1));
        });

        test("a completed tween is removed from the registry", () => {
            tweenTo(0, 1, { time: 100 });
            tweenTo(0, 1, { time: 100 });
            const [done, live] = created;

            done._listeners[EASING_EVENTS.COMPLETE]();
            pauseAllTweens();

            expect(done.pause).not.toHaveBeenCalled();
            expect(live.pause).toHaveBeenCalledTimes(1);
        });

        test("a tween created while paused starts paused", () => {
            pauseAllTweens();

            tweenTo(0, 1, { time: 100 });

            expect(created[0].pause).toHaveBeenCalledTimes(1);
        });

        test("a tween created after resume is not paused", () => {
            pauseAllTweens();
            resumeAllTweens();

            tweenTo(0, 1, { time: 100 });

            expect(created[0].pause).not.toHaveBeenCalled();
        });

        test("clearAllTweens resets the paused flag without calling play", () => {
            tweenTo(0, 1, { time: 100 });
            pauseAllTweens();

            clearAllTweens();
            tweenTo(0, 1, { time: 100 });

            expect(created[0].play).not.toHaveBeenCalled();
            expect(created[1].pause).not.toHaveBeenCalled();
        });

        test("clearAllTweens forgets live tweens", () => {
            tweenTo(0, 1, { time: 100 });

            clearAllTweens();
            pauseAllTweens();

            expect(created[0].pause).not.toHaveBeenCalled();
        });

        test("a tween started before pause stays pending while paused and resolves after complete", async () => {
            // real between.js needs requestAnimationFrame at import, which the node test
            // environment lacks, so drive the mocked tween's events by hand.
            let resolved = false;
            const promise = tweenTo(0, 1, { time: 100 }).then(() => {
                resolved = true;
            });
            const tween = created[0];

            pauseAllTweens();
            await Promise.resolve();
            expect(tween.pause).toHaveBeenCalledTimes(1);
            expect(resolved).toBe(false);

            resumeAllTweens();
            await Promise.resolve();
            expect(tween.play).toHaveBeenCalledTimes(1);
            expect(tween.pause.mock.invocationCallOrder[0]).toBeLessThan(
                tween.play.mock.invocationCallOrder[0],
            );
            expect(resolved).toBe(false);

            tween._listeners[EASING_EVENTS.COMPLETE]();
            await promise;
            expect(resolved).toBe(true);
        });

        test("infinite loop tweens still resolve via setTimeout and are not paused by it", async () => {
            jest.useFakeTimers();
            const promise = tweenTo(0, 1, { time: 100, loop: LOOPING.BOUNCE });
            expect(created[0]._listeners[EASING_EVENTS.COMPLETE]).toBeUndefined();

            jest.advanceTimersByTime(200);
            jest.useRealTimers();

            await expect(promise).resolves.toBe(created[0]);
        });
    });
});
