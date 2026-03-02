import { debounce, NOOP } from "../functions";

describe("functions.js", () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe("debounce", () => {
        test("does not call function immediately by default", () => {
            const fn = jest.fn();
            const debounced = debounce(fn, 100);
            debounced();
            expect(fn).not.toHaveBeenCalled();
        });

        test("calls function after wait period", () => {
            const fn = jest.fn();
            const debounced = debounce(fn, 100);
            debounced();
            jest.advanceTimersByTime(100);
            expect(fn).toHaveBeenCalledTimes(1);
        });

        test("resets timer on subsequent calls", () => {
            const fn = jest.fn();
            const debounced = debounce(fn, 100);
            debounced();
            jest.advanceTimersByTime(50);
            debounced();
            jest.advanceTimersByTime(50);
            expect(fn).not.toHaveBeenCalled();
            jest.advanceTimersByTime(50);
            expect(fn).toHaveBeenCalledTimes(1);
        });

        test("calls function immediately when immediate=true", () => {
            const fn = jest.fn();
            const debounced = debounce(fn, 100, true);
            debounced();
            expect(fn).toHaveBeenCalledTimes(1);
        });

        test("does not call again within wait when immediate=true", () => {
            const fn = jest.fn();
            const debounced = debounce(fn, 100, true);
            debounced();
            debounced();
            expect(fn).toHaveBeenCalledTimes(1);
        });
    });

    describe("NOOP", () => {
        test("returns its argument (identity function)", () => {
            expect(NOOP(42)).toBe(42);
            expect(NOOP("test")).toBe("test");
        });
    });
});
