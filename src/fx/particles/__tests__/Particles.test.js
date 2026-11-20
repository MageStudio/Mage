jest.mock("xstate", () => ({
    createMachine: jest.fn(),
    interpret: jest.fn(() => ({ start: jest.fn(), stop: jest.fn(), send: jest.fn() })),
}));
jest.mock("../../../scripts/Scripts", () => ({ get: jest.fn() }));
jest.mock("../../../lib/meshUtils", () => ({
    isScene: jest.fn(() => false),
    serializeQuaternion: jest.fn(),
    serializeVector: jest.fn(),
}));
jest.mock("../../../images/Images", () => ({ get: jest.fn() }));
jest.mock("../../../lib/easing", () => ({ tweenTo: jest.fn() }));
jest.mock("../../../core/Scene", () => {
    // Stand-in for Scene + Universe: tracks which bodies are registered.
    const bodies = new Set();
    return {
        __bodies: bodies,
        add: jest.fn(body => bodies.add(body)),
        remove: jest.fn(body => bodies.delete(body)),
        getScene: jest.fn(() => ({})),
    };
});

import Scene from "../../../core/Scene";
import { Particles } from "../Particles";
import ProtonParticleEmitter from "../ProtonParticleEmitter";
import ParticleEmitterGroup from "../ParticleEmitterGroup";

const makeParticles = () => {
    const particles = new Particles();
    particles.proton = {
        update: jest.fn(),
        addEmitter: jest.fn(),
        removeEmitter: jest.fn(),
        destroy: jest.fn(),
    };
    return particles;
};

const kill = emitter => {
    emitter.getSystem().dead = true;
};

describe("Particles dead emitter disposal", () => {
    beforeEach(() => {
        jest.useFakeTimers();
        Scene.__bodies.clear();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test("S9: a dead proton emitter is removed from proton, disposed, out of the scene and deleted", () => {
        const particles = makeParticles();
        const emitter = particles.add(new ProtonParticleEmitter());
        const body = emitter.getBody();
        const system = emitter.getSystem();
        const disposeSpy = jest.spyOn(emitter, "dispose");
        expect(Scene.__bodies.has(body)).toBe(true);

        kill(emitter);
        particles.update(0.016);

        expect(particles.proton.removeEmitter).toHaveBeenCalledWith(system);
        expect(disposeSpy).toHaveBeenCalledTimes(1);
        expect(emitter.isDisposed()).toBe(true);
        expect(Scene.remove).toHaveBeenCalledWith(body);
        expect(Scene.__bodies.has(body)).toBe(false);
        expect(particles.emitters.has(emitter.uuid())).toBe(false);
    });

    test("S9: a dead emitter group removes each member system, disposes the group and is deleted", () => {
        const particles = makeParticles();
        const a = new ProtonParticleEmitter({ name: "a" });
        const b = new ProtonParticleEmitter({ name: "b" });
        const group = particles.add(new ParticleEmitterGroup({ system: [a, b] }));
        const groupBody = group.getBody();
        const disposeSpy = jest.spyOn(group, "dispose");

        kill(a);
        kill(b);
        particles.update(0.016);

        const removed = particles.proton.removeEmitter.mock.calls.map(([s]) => s);
        expect(removed).toHaveLength(2);
        expect(removed).toEqual(expect.arrayContaining([a.getSystem(), b.getSystem()]));
        expect(removed).not.toContain(group.getSystem());
        expect(disposeSpy).toHaveBeenCalledTimes(1);
        expect(a.isDisposed()).toBe(true);
        expect(b.isDisposed()).toBe(true);
        expect(Scene.__bodies.has(groupBody)).toBe(false);
        expect(particles.emitters.has(group.uuid())).toBe(false);
    });

    test("hasEmitters uses the Map size", () => {
        const particles = makeParticles();
        expect(particles.hasEmitters()).toBe(false);
        particles.add(new ProtonParticleEmitter());
        expect(particles.hasEmitters()).toBe(true);
    });

    test("dispose resets emitters and toDispose", () => {
        const particles = makeParticles();
        particles.add(new ProtonParticleEmitter());
        particles.toDispose = ["x"];

        particles.dispose();

        expect(particles.emitters).toBeInstanceOf(Map);
        expect(particles.emitters.size).toBe(0);
        expect(particles.toDispose).toEqual([]);
        expect(particles.proton).toBeNull();
    });
});
