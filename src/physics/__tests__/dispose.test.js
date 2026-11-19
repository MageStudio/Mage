import Physics from "../index";
import Config from "../../core/config";
import { PHYSICS_EVENTS } from "../messages";

describe("Physics.dispose resets refresh state", () => {
    let physicsSpy;

    beforeEach(() => {
        jest.useFakeTimers();
        physicsSpy = jest.spyOn(Config, "physics");
        Physics.worker = { postMessage: jest.fn() };
    });

    afterEach(() => {
        jest.useRealTimers();
        physicsSpy.mockRestore();
        Physics.worker = undefined;
        Physics.refreshTimer = null;
        Physics.pendingRefreshRoots = new Map();
        Physics.workerReady = false;
    });

    const arm = () => {
        const fired = jest.fn();
        Physics.refreshTimer = setTimeout(fired, 0);
        Physics.pendingRefreshRoots = new Map([["a", {}]]);
        Physics.workerReady = true;
        return fired;
    };

    test("clears the timer, pending roots and workerReady when enabled", () => {
        physicsSpy.mockReturnValue({ enabled: true });
        const fired = arm();

        Physics.dispose();
        jest.runAllTimers();

        expect(fired).not.toHaveBeenCalled();
        expect(Physics.refreshTimer).toBeNull();
        expect(Physics.pendingRefreshRoots).toEqual(new Map());
        expect(Physics.workerReady).toBe(false);
        expect(Physics.worker.postMessage).toHaveBeenCalledWith({
            event: PHYSICS_EVENTS.TERMINATE,
        });
    });

    test("resets the same state when physics is disabled", () => {
        physicsSpy.mockReturnValue({ enabled: false });
        const fired = arm();

        Physics.dispose();
        jest.runAllTimers();

        expect(fired).not.toHaveBeenCalled();
        expect(Physics.refreshTimer).toBeNull();
        expect(Physics.pendingRefreshRoots.size).toBe(0);
        expect(Physics.workerReady).toBe(false);
        expect(Physics.worker.postMessage).not.toHaveBeenCalled();
    });
});
