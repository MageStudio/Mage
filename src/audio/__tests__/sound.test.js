jest.mock("xstate", () => ({
    createMachine: jest.fn(),
    interpret: jest.fn(() => ({ start: jest.fn(), stop: jest.fn(), send: jest.fn() })),
}));
jest.mock("../../scripts/Scripts", () => ({ get: jest.fn() }));
jest.mock("../../lib/easing", () => ({ tweenTo: jest.fn() }));
jest.mock("../../core/Scene", () => ({
    add: jest.fn(),
    remove: jest.fn(),
    getCameraBody: jest.fn(),
}));

import Audio from "../Audio";
import Sound from "../sound";

const makeParam = () => ({
    value: 0,
    setValueAtTime: jest.fn(),
    linearRampToValueAtTime: jest.fn(),
    exponentialRampToValueAtTime: jest.fn(),
});

const makeNode = () => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    gain: makeParam(),
    detune: makeParam(),
});

const makeSound = () => new Sound({ source: "boom" });

describe("Sound disposal", () => {
    beforeEach(() => {
        jest.useFakeTimers();
        Audio.reset();
        Audio.context = {
            currentTime: 0,
            createBufferSource: jest.fn(makeNode),
            createGain: jest.fn(makeNode),
        };
        Audio.masterVolumeNode = makeNode();
        Audio.buffersMap = { boom: { sampleRate: 44100, duration: 1, numberOfChannels: 2 } };
    });

    afterEach(() => {
        jest.useRealTimers();
        Audio.context = null;
        Audio.buffersMap = {};
        Audio.reset();
    });

    test("S10: dispose followed by pending timers does not rebuild or reconnect the audio graph", () => {
        const sound = makeSound();
        const setupAudio = jest.spyOn(sound, "setupAudio");
        const connect = jest.spyOn(sound, "connect");

        sound.dispose();
        jest.runAllTimers();

        expect(setupAudio).not.toHaveBeenCalled();
        expect(connect).not.toHaveBeenCalled();
    });

    test("S10: reset on a disposed sound is a no-op", () => {
        const sound = makeSound();
        sound.dispose();
        const setupAudio = jest.spyOn(sound, "setupAudio");
        const connect = jest.spyOn(sound, "connect");

        sound.reset();

        expect(setupAudio).not.toHaveBeenCalled();
        expect(connect).not.toHaveBeenCalled();
    });

    test("S10: dispose clears the pending stop timer", () => {
        const sound = makeSound();
        sound.stop();
        expect(jest.getTimerCount()).toBe(1);

        sound.dispose();

        expect(jest.getTimerCount()).toBe(0);
    });

    test("a new stop clears the earlier pending stop timer", () => {
        const sound = makeSound();
        const reset = jest.spyOn(sound, "reset");
        sound.reset = reset;

        sound.stop();
        sound.stop();

        expect(jest.getTimerCount()).toBe(1);
        jest.runAllTimers();
        expect(reset).toHaveBeenCalledTimes(1);
    });

    test("a disposed sound is removed from Audio.levelSounds", () => {
        const a = makeSound();
        const b = makeSound();
        expect(Audio.levelSounds.length).toBe(2);

        a.dispose();

        expect(Audio.levelSounds.length).toBe(1);
        expect(Audio.levelSounds[0]).toBe(b);
    });

    test("Audio.dispose disposes every level sound and ends empty", () => {
        const sounds = [makeSound(), makeSound(), makeSound()];
        const spies = sounds.map(s => jest.spyOn(s, "dispose"));

        Audio.dispose();

        spies.forEach(spy => expect(spy).toHaveBeenCalledTimes(1));
        expect(Audio.levelSounds.length).toBe(0);
    });

    test("disposing a deferred sound does not throw and Audio.dispose still clears every level sound", () => {
        const deferred = new Sound({ source: "boom", setupConfig: { deferred: true } });
        const other = makeSound();

        expect(deferred.volumeNode).toBeNull();
        expect(() => deferred.dispose()).not.toThrow();
        expect(Audio.levelSounds).toEqual([other]);

        const deferredToo = new Sound({ source: "boom", setupConfig: { deferred: true } });
        expect(() => Audio.dispose()).not.toThrow();
        expect(Audio.levelSounds.length).toBe(0);
        expect(deferredToo.isDisposed()).toBe(true);
        expect(other.isDisposed()).toBe(true);
    });
});
