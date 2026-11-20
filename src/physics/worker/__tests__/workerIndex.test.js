import { PHYSICS_EVENTS } from "../../messages";

describe("worker/index TERMINATE before Ammo loads", () => {
    let resolveAmmo;
    let initSpy;
    let simulateSpy;

    beforeEach(() => {
        global.self = global;
        global.importScripts = jest.fn();
        global.Ammo = () =>
            new Promise(resolve => {
                resolveAmmo = resolve;
            });
        global.postMessage = jest.fn();
        delete global.onmessage;
    });

    const load = () => {
        jest.isolateModules(() => {
            const world = require("../world").default;
            initSpy = jest.spyOn(world, "init").mockImplementation(() => {});
            simulateSpy = jest.spyOn(world, "simulate").mockImplementation(() => {});
            require("../index");
        });
    };

    test("S8 posts terminate and never initialises the world when Ammo resolves later", async () => {
        load();

        global.onmessage({
            data: { event: PHYSICS_EVENTS.LOAD.AMMO, host: "http://x", path: "ammo.js" },
        });
        expect(global.importScripts).toHaveBeenCalled();

        global.onmessage({ data: { event: PHYSICS_EVENTS.TERMINATE } });
        expect(global.postMessage).toHaveBeenCalledWith({ event: PHYSICS_EVENTS.TERMINATE });

        resolveAmmo({});
        await Promise.resolve();
        await Promise.resolve();

        expect(initSpy).not.toHaveBeenCalled();
        expect(simulateSpy).not.toHaveBeenCalled();
        expect(global.postMessage).not.toHaveBeenCalledWith({ event: PHYSICS_EVENTS.READY });
    });

    test("S8 TERMINATE with no load in flight still posts terminate", () => {
        load();

        global.onmessage({ data: { event: PHYSICS_EVENTS.TERMINATE } });

        expect(global.postMessage).toHaveBeenCalledWith({ event: PHYSICS_EVENTS.TERMINATE });
    });

    test("without TERMINATE the world initialises once Ammo resolves", async () => {
        load();

        global.onmessage({ data: { event: PHYSICS_EVENTS.LOAD.AMMO, host: "h" } });
        resolveAmmo({});
        await Promise.resolve();
        await Promise.resolve();

        expect(initSpy).toHaveBeenCalledTimes(1);
        expect(simulateSpy).toHaveBeenCalledTimes(1);
    });
});
