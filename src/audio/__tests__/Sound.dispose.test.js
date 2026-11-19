jest.mock("three", () => ({
    ...require("../../../__mocks__/three"),
    Object3D: class {
        clear() {}
        add() {}
        remove() {}
    },
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
jest.mock("../../scripts/Scripts", () => ({ get: jest.fn() }));
jest.mock("../../core/Scene", () => ({
    add: jest.fn(),
    remove: jest.fn(),
    getCameraBody: jest.fn(),
}));
jest.mock("../../core/universe", () => ({ getByTag: jest.fn(() => []) }));
jest.mock("../../lib/easing", () => ({ tweenTo: jest.fn() }));
jest.mock("../../lib/meshUtils", () => ({
    isScene: jest.fn(() => false),
    serializeQuaternion: jest.fn(),
    serializeVector: jest.fn(),
}));
jest.mock("../../entities/base/HelperSprite", () => jest.fn());

import AudioSingleton from "../Audio";
import Sound from "../sound";

const createNode = () => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    start: jest.fn(),
    detune: {},
    gain: {
        value: 0,
        setValueAtTime: jest.fn(),
        linearRampToValueAtTime: jest.fn(),
        exponentialRampToValueAtTime: jest.fn(),
    },
});

describe("Sound disposal", () => {
    let sound;

    beforeEach(() => {
        jest.useFakeTimers();
        AudioSingleton.reset();
        AudioSingleton.context = {
            currentTime: 0,
            createBufferSource: jest.fn(createNode),
            createGain: jest.fn(createNode),
        };
        AudioSingleton.masterVolumeNode = createNode();
        AudioSingleton.buffersMap = { "a.mp3": { duration: 1, sampleRate: 44100 } };

        sound = new Sound({ source: "a.mp3" });
    });

    afterEach(() => {
        jest.useRealTimers();
        AudioSingleton.context = null;
    });

    it("S10: a disposed sound is not rebuilt or reconnected when the stop timer fires", () => {
        const setupSpy = jest.spyOn(sound, "setupAudio");
        const connectSpy = jest.spyOn(sound, "connect");

        sound.dispose();
        setupSpy.mockClear();
        connectSpy.mockClear();
        jest.runAllTimers();

        expect(setupSpy).not.toHaveBeenCalled();
        expect(connectSpy).not.toHaveBeenCalled();
        expect(sound.isConnected()).toBe(false);
    });

    it("S10: reset on a disposed sound is a no-op", () => {
        sound.dispose();
        const setupSpy = jest.spyOn(sound, "setupAudio");

        sound.reset();

        expect(setupSpy).not.toHaveBeenCalled();
    });

    it("S10: dispose clears a pending stop timer", () => {
        sound.stop();
        expect(jest.getTimerCount()).toBe(1);

        sound.dispose();

        expect(jest.getTimerCount()).toBe(0);
    });

    it("a new stop clears the earlier pending stop timer", () => {
        sound.stop();
        sound.stop();

        expect(jest.getTimerCount()).toBe(1);
    });

    it("a disposed sound is removed from Audio.levelSounds", () => {
        expect(AudioSingleton.levelSounds).toContain(sound);

        sound.dispose();

        expect(AudioSingleton.levelSounds).not.toContain(sound);
    });

    it("Audio.dispose disposes every level sound and ends with levelSounds empty", () => {
        const second = new Sound({ source: "a.mp3" });
        const third = new Sound({ source: "a.mp3" });
        const sounds = [sound, second, third];
        const spies = sounds.map(s => jest.spyOn(s, "dispose"));

        AudioSingleton.dispose();

        spies.forEach(spy => expect(spy).toHaveBeenCalledTimes(1));
        expect(AudioSingleton.levelSounds).toEqual([]);
    });
});
