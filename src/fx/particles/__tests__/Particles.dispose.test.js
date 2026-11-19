jest.mock("three", () => ({
    ...require("../../../../__mocks__/three"),
    Object3D: class {
        clear() {}
        add() {}
        remove() {}
    },
    Sprite: class {},
    SpriteMaterial: class {},
    AdditiveBlending: 2,
}));
jest.mock("xstate", () => ({
    createMachine: jest.fn(),
    interpret: jest.fn(() => ({
        start: jest.fn(),
        stop: jest.fn(),
        send: jest.fn(),
        onTransition: jest.fn(),
    })),
}));
jest.mock("../../../scripts/Scripts", () => ({ get: jest.fn() }));
jest.mock("../../../core/Scene", () => ({
    add: jest.fn(),
    remove: jest.fn(),
    getScene: jest.fn(() => ({})),
}));
jest.mock("../../../core/universe", () => ({ getByTag: jest.fn(() => []) }));
jest.mock("../../../lib/meshUtils", () => ({
    isScene: jest.fn(() => false),
    serializeQuaternion: jest.fn(),
    serializeVector: jest.fn(),
}));
jest.mock("../../../lib/easing", () => ({ tweenTo: jest.fn() }));
jest.mock("../../../images/Images", () => ({ get: jest.fn() }));
jest.mock("../../../entities/base/HelperSprite", () => jest.fn());
jest.mock("three.proton", () => {
    class Emitter {
        constructor() {
            this.dead = false;
            this.initializes = [];
            this.behaviours = [];
        }
        addInitialize() {}
        addBehaviour() {}
        stopEmit() {}
        emit() {}
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
    Proton.SpriteRender = class {};
    Proton.Body = class {};
    return { __esModule: true, default: Proton };
});

import Scene from "../../../core/Scene";
import { Particles } from "../Particles";
import ProtonParticleEmitter from "../ProtonParticleEmitter";
import ParticleEmitterGroup from "../ParticleEmitterGroup";

describe("Particles disposal", () => {
    let particles;

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    beforeEach(() => {
        jest.useFakeTimers();
        jest.clearAllMocks();
        particles = new Particles();
        particles.init();
    });

    it("S9: disposes a dead single proton emitter and removes it from proton, Scene and the map", () => {
        const emitter = new ProtonParticleEmitter({ name: "single" });
        const disposeSpy = jest.spyOn(emitter, "dispose");
        const body = emitter.getBody();
        particles.add(emitter);
        emitter.getSystem().dead = true;

        particles.update(0.016);

        expect(disposeSpy).toHaveBeenCalledTimes(1);
        expect(particles.proton.removeEmitter).toHaveBeenCalledWith(emitter.getSystem());
        expect(Scene.remove).toHaveBeenCalledWith(body);
        expect(emitter.isDisposed()).toBe(true);
        expect(particles.emitters.has(emitter.uuid())).toBe(false);
    });

    it("S9: disposes a dead group, removing each member system from proton (not the group's Map)", () => {
        const a = new ProtonParticleEmitter({ name: "a" });
        const b = new ProtonParticleEmitter({ name: "b" });
        const group = new ParticleEmitterGroup({ name: "group", system: [a, b] });
        const groupDispose = jest.spyOn(group, "dispose");
        const groupBody = group.getBody();
        particles.add(group);
        a.getSystem().dead = true;
        b.getSystem().dead = true;

        particles.update(0.016);

        expect(groupDispose).toHaveBeenCalledTimes(1);
        const removed = particles.proton.removeEmitter.mock.calls.map(c => c[0]);
        expect(removed).toHaveLength(2);
        expect(removed).toContain(a.getSystem());
        expect(removed).toContain(b.getSystem());
        expect(removed).not.toContain(group.getSystem());
        expect(Scene.remove).toHaveBeenCalledWith(groupBody);
        expect(group.isDisposed()).toBe(true);
        expect(particles.emitters.has(group.uuid())).toBe(false);
    });

    it("hasEmitters reflects the Map size", () => {
        expect(particles.hasEmitters()).toBe(false);
        particles.add(new ProtonParticleEmitter({ name: "x" }));
        expect(particles.hasEmitters()).toBe(true);
    });

    it("dispose resets emitters and toDispose", () => {
        particles.add(new ProtonParticleEmitter({ name: "x" }));
        particles.toDispose = ["abc"];

        particles.dispose();

        expect(particles.emitters).toBeInstanceOf(Map);
        expect(particles.emitters.size).toBe(0);
        expect(particles.toDispose).toEqual([]);
        expect(particles.isInitialised()).toBe(false);
    });
});
