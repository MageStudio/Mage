import { PHYSICS_EVENTS } from "../../messages";

// The worker entry point assigns the global `onmessage`; give it somewhere to live.
const loadWorker = ammoFactory => {
    let mod;
    global.self = global;
    global.onmessage = undefined;
    global.importScripts = jest.fn();
    global.postMessage = jest.fn();
    global.Ammo = ammoFactory;
    jest.isolateModules(() => {
        const world = require("../world").default;
        jest.spyOn(world, "init");
        jest.spyOn(world, "simulate").mockImplementation(() => {});
        require("../index");
        mod = { world };
    });
    return mod;
};

afterEach(() => {
    delete global.onmessage;
    delete global.importScripts;
    delete global.postMessage;
    delete global.Ammo;
    jest.restoreAllMocks();
});

describe("worker TERMINATE before Ammo has loaded", () => {
    it("S8 posts TERMINATE and never initialises the world when Ammo resolves later", async () => {
        let resolveAmmo;
        const { world } = loadWorker(() => new Promise(resolve => (resolveAmmo = resolve)));

        global.onmessage({
            data: { event: PHYSICS_EVENTS.LOAD.AMMO, host: "http://h", path: "ammo.js" },
        });
        expect(global.importScripts).toHaveBeenCalled();

        global.onmessage({ data: { event: PHYSICS_EVENTS.TERMINATE } });
        expect(global.postMessage).toHaveBeenCalledWith({ event: PHYSICS_EVENTS.TERMINATE });

        resolveAmmo({});
        await Promise.resolve();
        await Promise.resolve();

        expect(world.init).not.toHaveBeenCalled();
        expect(world.simulate).not.toHaveBeenCalled();
        expect(world.isInitialised()).toBe(false);
        expect(global.postMessage).not.toHaveBeenCalledWith({ event: PHYSICS_EVENTS.READY });
    });

    it("S8 posts TERMINATE even when Ammo never resolves", () => {
        loadWorker(() => new Promise(() => {}));

        global.onmessage({ data: { event: PHYSICS_EVENTS.LOAD.AMMO, host: "http://h" } });
        global.onmessage({ data: { event: PHYSICS_EVENTS.TERMINATE } });

        expect(global.postMessage).toHaveBeenCalledTimes(1);
        expect(global.postMessage).toHaveBeenCalledWith({ event: PHYSICS_EVENTS.TERMINATE });
    });
});
