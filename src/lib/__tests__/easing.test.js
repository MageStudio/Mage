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

import { LOOPING, EASING_EVENTS, FUNCTIONS, tweenTo } from "../easing";

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
});
