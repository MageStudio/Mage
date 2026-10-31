jest.mock("../lib/dispatcher", () => ({
    __esModule: true,
    default: { sendPhysicsUpdate: jest.fn() },
}));
jest.mock("../elements", () => ({ handleElementUpdate: jest.fn() }));
jest.mock("../player", () => ({ handlePlayerUpdate: jest.fn() }));
jest.mock("../vehicles", () => ({ handleVehicleUpdate: jest.fn() }));

import { TYPES } from "../../constants";

// world.js reads `self.requestAnimationFrame` at module load; provide a `self`
// whose rAF just records the callback so the test drives each frame.
let World;
let dispatcher;
let handlers;
let scheduled;

beforeAll(() => {
    global.self = global;
    global.requestAnimationFrame = cb => {
        scheduled.push(cb);
        return scheduled.length;
    };
    World = require("../world").World;
    dispatcher = require("../lib/dispatcher").default;
    handlers = {
        element: require("../elements").handleElementUpdate,
        player: require("../player").handlePlayerUpdate,
        vehicle: require("../vehicles").handleVehicleUpdate,
    };
});

describe("World pause / resume", () => {
    let world;
    let now;

    beforeEach(() => {
        scheduled = [];
        now = 1000;
        jest.spyOn(Date, "now").mockImplementation(() => now);
        jest.clearAllMocks();

        world = new World();
        world.maxSubSteps = 3;
        world.fixedTimeStep = 1 / 60;
        world.dynamicsWorld = {
            stepSimulation: jest.fn(),
            getDispatcher: () => ({ getNumManifolds: () => 0 }),
        };
        world.elements = {
            box: { type: TYPES.BOX },
            player: { type: TYPES.PLAYER },
            vehicle: { type: TYPES.VEHICLE },
        };
        world.getElement = uuid => world.elements[uuid];
        world.removeDeletedElements = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("is not paused by default and steps normally", () => {
        expect(world.paused).toBe(false);

        world.simulate();

        expect(world.dynamicsWorld.stepSimulation).toHaveBeenCalledTimes(1);
        expect(dispatcher.sendPhysicsUpdate).toHaveBeenCalledTimes(1);
    });

    test("paused simulate reschedules but does not step, handle elements or post updates", () => {
        world.calculateCollisions = jest.fn();
        world.simulate();
        jest.clearAllMocks();
        scheduled = [];

        world.pause();
        world.simulate();

        expect(scheduled).toHaveLength(1);
        expect(world.dynamicsWorld.stepSimulation).not.toHaveBeenCalled();
        expect(handlers.element).not.toHaveBeenCalled();
        expect(handlers.player).not.toHaveBeenCalled();
        expect(handlers.vehicle).not.toHaveBeenCalled();
        expect(world.calculateCollisions).not.toHaveBeenCalled();
        expect(dispatcher.sendPhysicsUpdate).not.toHaveBeenCalled();
    });

    test("the first step after resume uses a dt no larger than one frame", () => {
        world.simulate(); // primes the clock at t=1000
        world.pause();

        now += 60000; // a long pause
        world.simulate();
        world.simulate();

        world.resume();
        now += 16;
        world.simulate();

        const dt = world.dynamicsWorld.stepSimulation.mock.calls.pop()[0];
        expect(dt).toBeCloseTo(0.016, 5);
        expect(dt).toBeLessThanOrEqual(1 / 30);
    });

    test("resume clears the flag and steps again", () => {
        world.pause();
        world.resume();

        expect(world.paused).toBe(false);

        world.simulate();
        expect(world.dynamicsWorld.stepSimulation).toHaveBeenCalledTimes(1);
        expect(dispatcher.sendPhysicsUpdate).toHaveBeenCalledTimes(1);
    });
});
