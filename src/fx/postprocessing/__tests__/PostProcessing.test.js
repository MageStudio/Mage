jest.mock("../../../core/Scene", () => ({
    getRenderer: jest.fn(),
    getScene: jest.fn(() => ({})),
    getCameraBody: jest.fn(() => ({})),
}));
jest.mock("../../../core/config", () => ({
    postprocessing: jest.fn(() => ({ enabled: true })),
    screen: jest.fn(() => ({ w: 100, h: 100 })),
}));

import Scene from "../../../core/Scene";
import { PostProcessing } from "../PostProcessing";
import EffectComposer from "../passes/EffectComposer";

const makeRenderer = () => ({
    getSize: jest.fn(() => ({ width: 100, height: 100 })),
    getPixelRatio: jest.fn(() => 1),
});

const makePass = (withDispose = true) => ({
    isPass: true,
    setSize: jest.fn(),
    ...(withDispose ? { dispose: jest.fn() } : {}),
});

describe("PostProcessing.dispose", () => {
    let addSpy;
    let removeSpy;

    beforeEach(() => {
        global.window = { addEventListener: jest.fn(), removeEventListener: jest.fn() };
        addSpy = global.window.addEventListener;
        removeSpy = global.window.removeEventListener;
        Scene.getRenderer.mockReturnValue(makeRenderer());
    });

    afterEach(() => {
        delete global.window;
    });

    test("removes the resize listener, disposes the composer and every pass and effect, and clears state", () => {
        const pp = new PostProcessing();
        pp.init();
        const composer = pp.composer;
        expect(addSpy).toHaveBeenCalledWith("resize", pp.onWindowResize, false);

        const rt1 = composer.renderTarget1;
        const rt2 = composer.renderTarget2;
        const rt1Dispose = jest.spyOn(rt1, "dispose");
        const rt2Dispose = jest.spyOn(rt2, "dispose");

        const outline = makePass();
        const noDispose = makePass(false);
        pp.addEffectToComposer(outline);
        pp.addEffectToComposer(noDispose);
        const custom = { render: jest.fn(), dispose: jest.fn() };
        const customWithout = { render: jest.fn() };
        pp.addEffectToCustomEffects(custom);
        pp.addEffectToCustomEffects(customWithout);

        expect(() => pp.dispose()).not.toThrow();

        expect(removeSpy).toHaveBeenCalledWith("resize", pp.onWindowResize);
        expect(rt1Dispose).toHaveBeenCalledTimes(1);
        expect(rt2Dispose).toHaveBeenCalledTimes(1);
        expect(outline.dispose).toHaveBeenCalledTimes(1);
        expect(custom.dispose).toHaveBeenCalledTimes(1);
        expect(pp.effects).toEqual([]);
        expect(pp.customs).toEqual([]);
        expect(pp.composer).toBeUndefined();
    });

    test("disposes passes that belong to the composer only once", () => {
        const pp = new PostProcessing();
        pp.init();
        const pass = makePass();
        pp.addEffectToComposer(pass);

        pp.dispose();

        expect(pass.dispose).toHaveBeenCalledTimes(1);
    });

    test("does not throw when post-processing was never enabled", () => {
        const pp = new PostProcessing();
        expect(pp.composer).toBeUndefined();

        expect(() => pp.dispose()).not.toThrow();
        expect(pp.effects).toEqual([]);
        expect(pp.customs).toEqual([]);
    });

    test("EffectComposer.dispose disposes both render targets", () => {
        const composer = new EffectComposer(makeRenderer());
        const a = jest.spyOn(composer.renderTarget1, "dispose");
        const b = jest.spyOn(composer.renderTarget2, "dispose");

        composer.dispose();

        expect(a).toHaveBeenCalledTimes(1);
        expect(b).toHaveBeenCalledTimes(1);
    });
});
