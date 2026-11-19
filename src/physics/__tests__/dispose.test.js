import Physics from "../index";
import Config from "../../core/config";
import { PHYSICS_EVENTS } from "../messages";

describe("Physics.dispose", () => {
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
    });

    const arm = () => {
        const callback = jest.fn();
        Physics.refreshTimer = setTimeout(callback, 1000);
        Physics.pendingRefreshRoots = new Map([["a", {}]]);
        Physics.workerReady = true;
        return callback;
    };

    [true, false].forEach(enabled => {
        test(`clears refreshTimer, pendingRefreshRoots and workerReady (physics enabled: ${enabled})`, () => {
            physicsSpy.mockReturnValue({ enabled });
            const callback = arm();

            Physics.dispose();
            jest.runAllTimers();

            expect(callback).not.toHaveBeenCalled();
            expect(Physics.refreshTimer).toBeNull();
            expect(Physics.pendingRefreshRoots).toBeInstanceOf(Map);
            expect(Physics.pendingRefreshRoots.size).toBe(0);
            expect(Physics.workerReady).toBe(false);
        });
    });

    test("still posts TERMINATE when physics is enabled", () => {
        physicsSpy.mockReturnValue({ enabled: true });

        Physics.dispose();

        expect(Physics.worker.postMessage).toHaveBeenCalledWith({
            event: PHYSICS_EVENTS.TERMINATE,
        });
    });
});
