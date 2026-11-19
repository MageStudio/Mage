jest.mock("three", () => require("../../../../__mocks__/three"));
jest.mock("../../../core/Scene", () => ({
    getRenderer: jest.fn(),
    getScene: jest.fn(),
    getCameraBody: jest.fn(),
}));
jest.mock("../../../core/config", () => ({
    postprocessing: jest.fn(() => ({ enabled: true })),
    screen: jest.fn(() => ({ w: 1, h: 1 })),
}));
jest.mock("../passes/EffectComposer", () =>
    jest.fn().mockImplementation(() => ({
        addPass: jest.fn(),
        dispose: jest.fn(),
        setSize: jest.fn(),
    })),
);
jest.mock("../passes/RenderPass", () => jest.fn());
jest.mock("../HueSaturationEffect", () => jest.fn());
jest.mock("../SepiaEffect", () => jest.fn());
jest.mock("../BloomPass", () => jest.fn());
jest.mock("../DepthOfField", () => jest.fn());
jest.mock("../SelectiveOutline", () => jest.fn());
jest.mock("../GlitchEffect", () => jest.fn());
jest.mock("../PixelEffect", () => jest.fn());
jest.mock("../OutlineEffect", () => jest.fn());

import { PostProcessing } from "../PostProcessing";

describe("PostProcessing dispose", () => {
    let addSpy;
    let removeSpy;

    beforeEach(() => {
        addSpy = jest.fn();
        removeSpy = jest.fn();
        global.window = { addEventListener: addSpy, removeEventListener: removeSpy };
    });

    afterEach(() => {
        delete global.window;
    });

    it("S11: removes the resize listener, disposes composer, passes and effects, and clears lists", () => {
        const pp = new PostProcessing();
        pp.init();
        const composer = pp.composer;
        const pass = { isPass: true, dispose: jest.fn() };
        const selectiveOutline = { isPass: true, dispose: jest.fn() };
        const passWithoutDispose = { isPass: true };
        const custom = { dispose: jest.fn(), render: jest.fn() };
        pp.effects = [pass, selectiveOutline, passWithoutDispose];
        pp.customs = [custom];

        pp.dispose();

        expect(removeSpy).toHaveBeenCalledWith("resize", pp.onWindowResize);
        expect(composer.dispose).toHaveBeenCalledTimes(1);
        expect(pass.dispose).toHaveBeenCalledTimes(1);
        expect(selectiveOutline.dispose).toHaveBeenCalledTimes(1);
        expect(custom.dispose).toHaveBeenCalledTimes(1);
        expect(pp.effects).toEqual([]);
        expect(pp.customs).toEqual([]);
        expect(pp.composer).toBeUndefined();
    });

    it("S11: does not throw when post-processing was never enabled", () => {
        const pp = new PostProcessing();

        expect(() => pp.dispose()).not.toThrow();
        expect(pp.effects).toEqual([]);
        expect(pp.customs).toEqual([]);
    });
});
