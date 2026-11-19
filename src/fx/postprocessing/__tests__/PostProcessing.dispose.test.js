const mockComposer = () => ({
    addPass: jest.fn(function (pass) {
        this.passes.push(pass);
    }),
    ensureLastPassIsRendered: jest.fn(),
    dispose: jest.fn(),
    passes: [],
});

jest.mock("../passes/EffectComposer", () => jest.fn(() => mockComposer()));
jest.mock("../passes/RenderPass", () => jest.fn(() => ({ isPass: true })));
jest.mock("../../../core/Scene", () => ({
    getRenderer: jest.fn(),
    getScene: jest.fn(),
    getCameraBody: jest.fn(),
}));
jest.mock("../../../core/config", () => ({
    postprocessing: jest.fn(() => ({ enabled: true })),
    screen: jest.fn(() => ({ w: 1, h: 1 })),
}));
[
    "HueSaturationEffect",
    "SepiaEffect",
    "BloomPass",
    "DepthOfField",
    "SelectiveOutline",
    "GlitchEffect",
    "PixelEffect",
    "OutlineEffect",
].forEach(name => jest.mock(`../${name}`, () => jest.fn()));

import { PostProcessing } from "../PostProcessing";

describe("PostProcessing.dispose", () => {
    let addSpy;
    let removeSpy;

    beforeEach(() => {
        global.window = { addEventListener: jest.fn(), removeEventListener: jest.fn() };
        addSpy = global.window.addEventListener;
        removeSpy = global.window.removeEventListener;
    });

    afterEach(() => {
        delete global.window;
    });

    test("removes the resize listener, disposes composer, passes and effects, and clears lists", () => {
        const pp = new PostProcessing();
        pp.init();
        const composer = pp.composer;

        const outline = { isPass: true, dispose: jest.fn() };
        const plain = { isPass: true };
        const custom = { dispose: jest.fn(), render: jest.fn() };
        pp.add({ effect: () => outline, isClass: false });
        pp.add({ effect: () => plain, isClass: false });
        pp.add({ effect: () => custom, isClass: false });
        const renderPass = composer.passes[0];
        renderPass.dispose = jest.fn();

        pp.dispose();

        expect(addSpy).toHaveBeenCalledWith("resize", pp.onWindowResize, false);
        expect(removeSpy).toHaveBeenCalledWith("resize", pp.onWindowResize);
        expect(composer.dispose).toHaveBeenCalledTimes(1);
        expect(outline.dispose).toHaveBeenCalledTimes(1);
        expect(custom.dispose).toHaveBeenCalledTimes(1);
        expect(renderPass.dispose).toHaveBeenCalledTimes(1);
        expect(pp.effects).toEqual([]);
        expect(pp.customs).toEqual([]);
        expect(pp.composer).toBeUndefined();
    });

    test("does not throw when post-processing was never enabled", () => {
        const pp = new PostProcessing();

        expect(() => pp.dispose()).not.toThrow();
        expect(pp.effects).toEqual([]);
        expect(pp.customs).toEqual([]);
    });
});
