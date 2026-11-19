jest.mock("three", () => {
    class WebGLRenderTarget {
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.texture = {};
            this.dispose = jest.fn();
        }
        clone() {
            return new WebGLRenderTarget(this.width, this.height);
        }
    }
    return {
        ...require("../../../../__mocks__/three"),
        WebGLRenderTarget,
        Clock: class {},
    };
});
jest.mock("../passes/ShaderPass", () => jest.fn());
jest.mock("../passes/MaskPass", () => jest.fn());
jest.mock("../passes/ClearMaskPass", () => jest.fn());
jest.mock("../shaders/CopyShader", () => ({}));

import EffectComposer from "../passes/EffectComposer";

describe("EffectComposer dispose", () => {
    it("S11: disposes both render targets", () => {
        const renderer = {
            getSize: jest.fn(() => ({ width: 10, height: 10 })),
            getPixelRatio: jest.fn(() => 1),
        };
        const composer = new EffectComposer(renderer);
        const { renderTarget1, renderTarget2 } = composer;

        composer.dispose();

        expect(renderTarget1.dispose).toHaveBeenCalledTimes(1);
        expect(renderTarget2.dispose).toHaveBeenCalledTimes(1);
    });
});
