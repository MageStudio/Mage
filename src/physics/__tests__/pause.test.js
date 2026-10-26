import Physics from "../index";
import Config from "../../core/config";
import { PHYSICS_EVENTS } from "../messages";

describe("Physics.pause / Physics.resume", () => {
    let physicsSpy;
    let postMessage;

    beforeEach(() => {
        postMessage = jest.fn();
        physicsSpy = jest.spyOn(Config, "physics");
        Physics.worker = { postMessage };
    });

    afterEach(() => {
        physicsSpy.mockRestore();
        Physics.worker = undefined;
    });

    test("pause posts physics:pause when physics is enabled", () => {
        physicsSpy.mockReturnValue({ enabled: true });

        Physics.pause();

        expect(postMessage).toHaveBeenCalledTimes(1);
        expect(postMessage).toHaveBeenCalledWith({ event: PHYSICS_EVENTS.PAUSE });
    });

    test("resume posts physics:resume when physics is enabled", () => {
        physicsSpy.mockReturnValue({ enabled: true });

        Physics.resume();

        expect(postMessage).toHaveBeenCalledTimes(1);
        expect(postMessage).toHaveBeenCalledWith({ event: PHYSICS_EVENTS.RESUME });
    });

    test("neither posts nor throws when physics is disabled", () => {
        physicsSpy.mockReturnValue({ enabled: false });

        expect(() => Physics.pause()).not.toThrow();
        expect(() => Physics.resume()).not.toThrow();
        expect(postMessage).not.toHaveBeenCalled();
    });

    test("neither throws when enabled but the worker does not exist yet", () => {
        physicsSpy.mockReturnValue({ enabled: true });
        Physics.worker = undefined;

        expect(() => Physics.pause()).not.toThrow();
        expect(() => Physics.resume()).not.toThrow();
    });
});
