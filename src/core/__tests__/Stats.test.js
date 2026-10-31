let Stats;
let now;

beforeEach(() => {
    now = 1000;
    jest.spyOn(performance, "now").mockImplementation(() => now);
    jest.isolateModules(() => {
        Stats = require("../Stats").default;
    });
});

afterEach(() => jest.restoreAllMocks());

const info = (calls, triangles) => ({ render: { calls, triangles } });

describe("Stats.render", () => {
    test("emits the last frame's calls and triangles once a second, nothing in between", () => {
        const handler = jest.fn();
        Stats.render.subscribe(handler);

        Stats.update(0.016, info(10, 100));
        now += 500;
        Stats.update(0.016, info(20, 200));
        expect(handler).not.toHaveBeenCalled();

        now += 600;
        Stats.update(0.016, info(30, 300));
        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith({
            calls: 30,
            triangles: 300,
            instancedGroups: 0,
            instancedMeshes: 0,
        });

        now += 100;
        Stats.update(0.016, info(40, 400));
        expect(handler).toHaveBeenCalledTimes(1);
    });

    test("fps subscribers keep working", () => {
        const handler = jest.fn();
        Stats.subscribe(handler);
        now += 1000;
        Stats.update(0.016, info(1, 1));
        expect(handler).toHaveBeenCalledTimes(1);
    });

    test("update without info does not throw", () => {
        expect(() => Stats.update(0.016)).not.toThrow();
    });
});

describe("Stats.render instancing counts", () => {
    const emitted = () => {
        const handler = jest.fn();
        Stats.render.subscribe(handler);
        now += 1000;
        Stats.update(0.016, info(1, 2));
        return handler.mock.calls[0][0];
    };

    test("reports Instancing.getStats groups and meshes", () => {
        // Load Stats and Instancing from the same isolated registry so the spy is the one Stats uses.
        jest.isolateModules(() => {
            const I = require("../Instancing").default;
            jest.spyOn(I, "getStats").mockReturnValue({ groups: 3, meshes: 12 });
            Stats = require("../Stats").default;
        });
        expect(emitted()).toMatchObject({ instancedGroups: 3, instancedMeshes: 12 });
    });

    test("reports 0/0 when instancing is off", () => {
        expect(emitted()).toMatchObject({ instancedGroups: 0, instancedMeshes: 0 });
    });
});
