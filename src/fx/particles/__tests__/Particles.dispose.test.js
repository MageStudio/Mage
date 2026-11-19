jest.mock("three", () => ({
    ...require("../../../../__mocks__/three"),
    Object3D: class Object3D {
        clear() {}
    },
    Sprite: class Sprite {},
    SpriteMaterial: class SpriteMaterial {},
    AdditiveBlending: 2,
}));

// Stand-in for Scene + Universe: add registers the body, remove drops it.
jest.mock("../../../core/Scene", () => {
    const universe = new Set();
    return {
        __universe: universe,
        add: jest.fn(body => universe.add(body)),
        remove: jest.fn(body => universe.delete(body)),
        getScene: jest.fn(() => ({})),
    };
});
jest.mock("../../../core/universe", () => ({ getByTag: jest.fn(() => []) }));
jest.mock("../../../scripts/Scripts", () => ({ get: jest.fn() }));
jest.mock("../../../images/Images", () => ({ get: jest.fn() }));
jest.mock("../../../entities/base/HelperSprite", () => class HelperSprite {});
jest.mock("../../../lib/meshUtils", () => ({ isScene: jest.fn(() => false) }));
jest.mock("../../../lib/easing", () => ({ tweenTo: jest.fn() }));
jest.mock("xstate", () => ({ createMachine: jest.fn(), interpret: jest.fn() }));
jest.mock("three.proton", () => {
    class Emitter {
        constructor() {
            this.dead = false;
            this.initializes = [];
            this.behaviours = [];
            this.p = {};
            this.rotation = {};
        }
        addInitialize() {}
        addBehaviour() {}
        stopEmit() {}
        removeAllParticles() {}
        destroy() {}
    }
    class Proton {
        constructor() {
            this.addEmitter = jest.fn();
            this.removeEmitter = jest.fn();
            this.addRender = jest.fn();
            this.update = jest.fn();
            this.destroy = jest.fn();
        }
    }
    Proton.Emitter = Emitter;
    Proton.SpriteRender = class SpriteRender {};
    Proton.Body = class Body {};
    return { __esModule: true, default: Proton };
});
jest.mock("../Fountain", () => class Fountain {});
jest.mock("../Explosion", () => class Explosion {});
jest.mock("../Fire", () => class Fire {});
jest.mock("../Rain", () => class Rain {});
jest.mock("../Snow", () => class Snow {});
jest.mock("../Trail", () => class Trail {});

import Scene from "../../../core/Scene";
import { Particles } from "../Particles";
import ProtonParticleEmitter from "../ProtonParticleEmitter";
import ParticleEmitterGroup from "../ParticleEmitterGroup";

describe("Particles dead emitter disposal", () => {
    let particles;

    beforeEach(() => {
        jest.useFakeTimers();
        Scene.__universe.clear();
        particles = new Particles();
        particles.init();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test("a dead proton emitter is removed from proton, disposed, and leaves the universe", () => {
        const emitter = new ProtonParticleEmitter({ name: "single" });
        const body = emitter.getBody();
        const disposeSpy = jest.spyOn(emitter, "dispose");
        particles.add(emitter);
        expect(Scene.__universe.has(body)).toBe(true);

        emitter.system.dead = true;
        particles.update(0.016);

        expect(particles.proton.removeEmitter).toHaveBeenCalledWith(emitter.getSystem());
        expect(disposeSpy).toHaveBeenCalledTimes(1);
        expect(Scene.__universe.has(body)).toBe(false);
        expect(particles.emitters.has(emitter.uuid())).toBe(false);
    });

    test("a dead group removes each member system from proton and disposes the group", () => {
        const a = new ProtonParticleEmitter({ name: "a" });
        const b = new ProtonParticleEmitter({ name: "b" });
        const group = new ParticleEmitterGroup({ name: "group", system: [a, b] });
        const groupBody = group.getBody();
        const disposeSpy = jest.spyOn(group, "dispose");
        particles.add(group);

        a.system.dead = true;
        b.system.dead = true;
        particles.update(0.016);

        const removed = particles.proton.removeEmitter.mock.calls.map(([arg]) => arg);
        expect(removed).toHaveLength(2);
        expect(removed).toContain(a.getSystem());
        expect(removed).toContain(b.getSystem());
        expect(removed).not.toContain(group.getSystem());
        expect(disposeSpy).toHaveBeenCalledTimes(1);
        expect(Scene.__universe.has(groupBody)).toBe(false);
        expect(Scene.__universe.has(a.getBody())).toBe(false);
        expect(Scene.__universe.has(b.getBody())).toBe(false);
        expect(particles.emitters.has(group.uuid())).toBe(false);
    });

    test("hasEmitters reflects the size of the emitters Map", () => {
        expect(particles.hasEmitters()).toBe(false);
        const emitter = new ProtonParticleEmitter({ name: "x" });
        particles.add(emitter);
        expect(particles.hasEmitters()).toBe(true);
        particles.emitters.delete(emitter.uuid());
        expect(particles.hasEmitters()).toBe(false);
    });

    test("dispose resets emitters and toDispose", () => {
        particles.add(new ProtonParticleEmitter({ name: "x" }));
        particles.toDispose = ["abc"];

        particles.dispose();

        expect(particles.emitters).toBeInstanceOf(Map);
        expect(particles.emitters.size).toBe(0);
        expect(particles.toDispose).toEqual([]);
        expect(particles.isInitialised()).toBe(false);
    });
});
