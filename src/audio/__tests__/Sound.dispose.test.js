jest.mock("three", () => ({
    ...require("../../../__mocks__/three"),
    Object3D: class Object3D {
        clear() {}
    },
}));
jest.mock("../../core/Scene", () => ({
    add: jest.fn(),
    remove: jest.fn(),
    getCameraBody: jest.fn(),
}));
jest.mock("../../core/universe", () => ({ getByTag: jest.fn(() => []) }));
jest.mock("../../scripts/Scripts", () => ({ get: jest.fn() }));
jest.mock("../../images/Images", () => ({ get: jest.fn() }));
jest.mock("../../entities/base/HelperSprite", () => class HelperSprite {});
jest.mock("../../lib/meshUtils", () => ({ isScene: jest.fn(() => false) }));
jest.mock("../../lib/easing", () => ({ tweenTo: jest.fn() }));
jest.mock("xstate", () => ({ createMachine: jest.fn(), interpret: jest.fn() }));

import Audio from "../Audio";
import Sound from "../sound";

const fakeNode = () => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    gain: {
        value: 0,
        setValueAtTime: jest.fn(),
        linearRampToValueAtTime: jest.fn(),
        exponentialRampToValueAtTime: jest.fn(),
    },
});

describe("Sound disposal", () => {
    beforeEach(() => {
        jest.useFakeTimers();
        Audio.levelSounds = [];
        Audio.buffersMap = { clip: { sampleRate: 44100, duration: 1, numberOfChannels: 2 } };
        Audio.context = {
            currentTime: 0,
            createBufferSource: jest.fn(fakeNode),
            createGain: jest.fn(fakeNode),
        };
        Audio.masterVolumeNode = fakeNode();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    const create = () => new Sound({ source: "clip" });

    test("dispose followed by timers does not rebuild or reconnect the audio graph", () => {
        const sound = create();
        const setupAudio = jest.spyOn(sound, "setupAudio");
        const connect = jest.spyOn(sound, "connect");

        sound.dispose();
        jest.runAllTimers();

        expect(setupAudio).not.toHaveBeenCalled();
        expect(connect).not.toHaveBeenCalled();
    });

    test("reset on a disposed sound is a no-op", () => {
        const sound = create();
        sound.dispose();
        const setupAudio = jest.spyOn(sound, "setupAudio");
        const connect = jest.spyOn(sound, "connect");

        sound.reset();

        expect(setupAudio).not.toHaveBeenCalled();
        expect(connect).not.toHaveBeenCalled();
    });

    test("dispose clears the pending stop timer", () => {
        const sound = create();
        sound.stop();
        expect(jest.getTimerCount()).toBe(1);

        sound.dispose();

        expect(jest.getTimerCount()).toBe(0);
    });

    test("each stop replaces the earlier pending timer", () => {
        const sound = create();
        const reset = jest.spyOn(sound, "reset");

        sound.stop();
        sound.stop();
        sound.stop();
        expect(jest.getTimerCount()).toBe(1);
        jest.runAllTimers();

        expect(reset).toHaveBeenCalledTimes(1);
    });

    test("a disposed sound is removed from Audio.levelSounds", () => {
        const a = create();
        const b = create();
        expect(Audio.levelSounds).toEqual([a, b]);

        a.dispose();

        expect(Audio.levelSounds).toEqual([b]);
    });

    test("Audio.dispose disposes every level sound and leaves levelSounds empty", () => {
        const sounds = [create(), create(), create()];
        const spies = sounds.map(s => jest.spyOn(s, "dispose"));

        Audio.dispose();

        spies.forEach(spy => expect(spy).toHaveBeenCalledTimes(1));
        expect(Audio.levelSounds).toEqual([]);
    });
});
