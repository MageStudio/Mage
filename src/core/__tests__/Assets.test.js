jest.mock("whatwg-fetch", () => ({ fetch: jest.fn() }));
// between.js (pulled in transitively via lib/easing) touches
// requestAnimationFrame at import time, which the node test env lacks.
jest.mock("../../lib/easing", () => ({ tweenTo: jest.fn(() => Promise.resolve()) }));

let Assets;

beforeEach(() => {
    // parseAssets reduces into a module-level default object, so every test
    // gets a fresh module instance.
    jest.isolateModules(() => {
        ({ Assets } = require("../Assets"));
    });
});

describe("Assets.parseAssets", () => {
    test("stores level assets under the original, case-preserved key", () => {
        const textures = { wall: "/wall.png" };
        const parsed = new Assets().parseAssets({
            "/Sunny Meadow": { textures },
        });

        expect(parsed.levels["/Sunny Meadow"]).toBeDefined();
        expect(parsed.levels["/Sunny Meadow"].textures).toBe(textures);
        expect(parsed.levels["/sunny meadow"]).toBeUndefined();
    });

    test("makes case-preserved level assets reachable through the exact route", () => {
        const textures = { wall: "/wall.png" };
        const assets = new Assets();
        assets.setAssets({ "/Sunny Meadow": { textures } });

        expect(assets.textures("/Sunny Meadow")).toBe(textures);
    });

    test("still matches asset type keys case-insensitively", () => {
        const textures = { wall: "/wall.png" };
        const models = { tower: "/tower.fbx" };
        const parsed = new Assets().parseAssets({ Textures: textures, MODELS: models });

        expect(parsed.common.textures).toBe(textures);
        expect(parsed.common.models).toBe(models);
    });

    test("drops keys that are neither asset types nor level routes", () => {
        const parsed = new Assets().parseAssets({
            "Sunny Meadow": { textures: { wall: "/wall.png" } },
        });

        expect(parsed.levels["Sunny Meadow"]).toBeUndefined();
        expect(parsed.levels["sunny meadow"]).toBeUndefined();
        expect(parsed.common["Sunny Meadow"]).toBeUndefined();
    });
});
