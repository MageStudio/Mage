import { Config } from "../config";

describe("Config", () => {
    let config;

    beforeEach(() => {
        config = new Config();
    });

    describe("defaults", () => {
        test("physics defaults", () => {
            expect(config.physics()).toEqual({
                enabled: false,
                path: "./ammo.js",
                gravity: { x: 0, y: -30, z: 0 },
                fixedTimeStep: 1 / 60,
                maxSubSteps: 3,
            });
        });

        test("camera defaults", () => {
            expect(config.camera()).toEqual({ fov: 75, near: 0.1, far: 10000 });
        });

        test("ui defaults", () => {
            expect(config.ui()).toEqual({ enabled: true });
        });
    });

    describe("setConfig (flat shape → common)", () => {
        test("merges flat overrides into common", () => {
            config.setConfig({ physics: { enabled: true } });
            expect(config.physics()).toEqual({
                enabled: true,
                path: "./ammo.js",
                gravity: { x: 0, y: -30, z: 0 },
                fixedTimeStep: 1 / 60,
                maxSubSteps: 3,
            });
        });

        test("multiple setConfig calls merge, not replace", () => {
            config.setConfig({ physics: { enabled: true } });
            config.setConfig({ fog: { enabled: true, color: "#000000" } });
            expect(config.physics().enabled).toBe(true);
            expect(config.fog().enabled).toBe(true);
            expect(config.fog().color).toBe("#000000");
        });
    });

    describe("setConfig (levels key → per-level)", () => {
        test("stores per-level overrides", () => {
            config.setConfig({
                levels: {
                    moon: { physics: { gravity: { y: -1.6 } } },
                },
            });
            expect(config.physics("moon")).toEqual({
                enabled: false,
                path: "./ammo.js",
                gravity: { x: 0, y: -1.6, z: 0 },
                fixedTimeStep: 1 / 60,
                maxSubSteps: 3,
            });
        });

        test("level not present falls back to common", () => {
            config.setConfig({
                levels: { moon: { physics: { gravity: { y: -1.6 } } } },
            });
            expect(config.physics("earth")).toEqual({
                enabled: false,
                path: "./ammo.js",
                gravity: { x: 0, y: -30, z: 0 },
                fixedTimeStep: 1 / 60,
                maxSubSteps: 3,
            });
        });

        test("accepts both common and levels in one call", () => {
            config.setConfig({
                physics: { enabled: true },
                levels: { moon: { physics: { gravity: { y: -1.6 } } } },
            });
            expect(config.physics()).toEqual({
                enabled: true,
                path: "./ammo.js",
                gravity: { x: 0, y: -30, z: 0 },
                fixedTimeStep: 1 / 60,
                maxSubSteps: 3,
            });
            expect(config.physics("moon")).toEqual({
                enabled: true,
                path: "./ammo.js",
                gravity: { x: 0, y: -1.6, z: 0 },
                fixedTimeStep: 1 / 60,
                maxSubSteps: 3,
            });
        });
    });

    describe("current level", () => {
        beforeEach(() => {
            config.setConfig({
                physics: { enabled: true },
                levels: {
                    moon: { physics: { gravity: { y: -1.6 } } },
                    earth: { physics: { gravity: { y: -9.8 } } },
                },
            });
        });

        test("getters use common when no current level", () => {
            expect(config.physics().gravity.y).toBe(-30);
        });

        test("getters use merged common+level after setCurrentLevel", () => {
            config.setCurrentLevel("moon");
            expect(config.physics().gravity.y).toBe(-1.6);
            expect(config.physics().enabled).toBe(true);
        });

        test("switching current level swaps which override applies", () => {
            config.setCurrentLevel("moon");
            expect(config.physics().gravity.y).toBe(-1.6);
            config.setCurrentLevel("earth");
            expect(config.physics().gravity.y).toBe(-9.8);
        });

        test("explicit level arg overrides current level", () => {
            config.setCurrentLevel("moon");
            expect(config.physics("earth").gravity.y).toBe(-9.8);
            expect(config.physics().gravity.y).toBe(-1.6);
        });

        test("current level pointing at unknown level falls back to common", () => {
            config.setCurrentLevel("mars");
            expect(config.physics().gravity.y).toBe(-30);
        });
    });

    describe("deep merge semantics", () => {
        test("nested object overrides only specified keys", () => {
            config.setConfig({
                levels: { moon: { physics: { gravity: { x: 1 } } } },
            });
            expect(config.physics("moon").gravity).toEqual({ x: 1, y: -30, z: 0 });
        });

        test("common changes do not leak into stored level overrides", () => {
            config.setConfig({ levels: { moon: { physics: { gravity: { y: -1.6 } } } } });
            config.setConfig({ physics: { gravity: { x: 5 } } });
            expect(config.physics("moon").gravity).toEqual({ x: 5, y: -1.6, z: 0 });
        });

        test("per-level fixedTimeStep and maxSubSteps override", () => {
            config.setConfig({
                levels: {
                    slowmo: { physics: { fixedTimeStep: 1 / 30, maxSubSteps: 5 } },
                },
            });
            expect(config.physics("slowmo").fixedTimeStep).toBe(1 / 30);
            expect(config.physics("slowmo").maxSubSteps).toBe(5);
            expect(config.physics().fixedTimeStep).toBe(1 / 60);
            expect(config.physics().maxSubSteps).toBe(3);
        });
    });
});
