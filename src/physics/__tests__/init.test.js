/**
 * Integration test for the contract between Config and Physics.init().
 *
 * Physics.init() composes the LOAD.AMMO worker message by spreading
 * Config.physics() into it (src/physics/index.js).  Because every level
 * switch disposes the physics worker and re-runs init() with the new
 * current level set on Config, per-level physics overrides flow into
 * the worker through this single message without any extra plumbing.
 *
 * The Physics module itself can't be imported here — it pulls in
 * `worker:./worker` which is resolved by the bundler, not Jest — so
 * we reconstruct the payload locally to lock in the contract.
 */

import { Config } from "../../core/config";
import { PHYSICS_EVENTS } from "../messages";

const buildLoadAmmoPayload = (config, host = "https://test.host") => ({
    event: PHYSICS_EVENTS.LOAD.AMMO,
    ...config.physics(),
    host,
});

describe("Physics init payload composition", () => {
    test("payload carries per-level gravity override when current level is set", () => {
        const config = new Config();
        config.setConfig({
            physics: { enabled: true },
            levels: {
                moon: { physics: { gravity: { y: -1.6 } } },
            },
        });
        config.setCurrentLevel("moon");

        const payload = buildLoadAmmoPayload(config);

        expect(payload.event).toBe(PHYSICS_EVENTS.LOAD.AMMO);
        expect(payload.enabled).toBe(true);
        expect(payload.gravity).toEqual({ x: 0, y: -1.6, z: 0 });
    });

    test("payload carries per-level fixedTimeStep and maxSubSteps overrides", () => {
        const config = new Config();
        config.setConfig({
            physics: { enabled: true },
            levels: {
                slowmo: { physics: { fixedTimeStep: 1 / 120, maxSubSteps: 5 } },
            },
        });
        config.setCurrentLevel("slowmo");

        const payload = buildLoadAmmoPayload(config);

        expect(payload.fixedTimeStep).toBe(1 / 120);
        expect(payload.maxSubSteps).toBe(5);
    });

    test("payload falls back to common physics when no current level is set", () => {
        const config = new Config();
        config.setConfig({
            physics: { enabled: true },
            levels: {
                moon: { physics: { gravity: { y: -1.6 } } },
            },
        });

        const payload = buildLoadAmmoPayload(config);

        expect(payload.gravity).toEqual({ x: 0, y: -30, z: 0 });
        expect(payload.fixedTimeStep).toBe(1 / 60);
        expect(payload.maxSubSteps).toBe(3);
    });

    test("switching current level yields different payloads", () => {
        const config = new Config();
        config.setConfig({
            physics: { enabled: true },
            levels: {
                moon: { physics: { gravity: { y: -1.6 } } },
                earth: { physics: { gravity: { y: -9.8 } } },
            },
        });

        config.setCurrentLevel("moon");
        const moonPayload = buildLoadAmmoPayload(config);

        config.setCurrentLevel("earth");
        const earthPayload = buildLoadAmmoPayload(config);

        expect(moonPayload.gravity.y).toBe(-1.6);
        expect(earthPayload.gravity.y).toBe(-9.8);
    });

    test("host field is preserved alongside the spread Config.physics()", () => {
        const config = new Config();
        config.setConfig({ physics: { enabled: true } });

        const payload = buildLoadAmmoPayload(config, "https://cdn.example/assets");

        expect(payload.host).toBe("https://cdn.example/assets");
        expect(payload.enabled).toBe(true);
        expect(payload.path).toBe("./ammo.js");
    });
});
