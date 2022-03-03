/**
 * @author alteredq / http://alteredqualia.com/
 */
import {
	AdditiveBlending,
	LinearFilter,
	RGBAFormat,
	ShaderMaterial,
	UniformsUtils,
	Vector2,
	WebGLRenderTarget
} from "three";

import Pass, { FullScreenQuad } from "./passes/Pass";
import CopyShader from "./shaders/CopyShader";
import ConvolutionShader from "./shaders/ConvolutionShader";

const BLUR_X = new Vector2(0.001953125, 0.0);
const BLUR_Y = new Vector2(0.0, 0.001953125);

export default class BloomPass extends Pass {

	constructor({ strength = 1, kernelSize = 25, sigma = 4.0, resolution = 256, renderToScreen = false }) {
		super();

		const pars = { minFilter: LinearFilter, magFilter: LinearFilter, format: RGBAFormat };

		this.renderTargetX = new WebGLRenderTarget(resolution, resolution, pars);
		this.renderTargetX.texture.name = "BloomPass.x";
		this.renderTargetY = new WebGLRenderTarget(resolution, resolution, pars);
		this.renderTargetY.texture.name = "BloomPass.y";

		// copy material
		const copyShader = { ...CopyShader };

		this.copyUniforms = UniformsUtils.clone(copyShader.uniforms);
		this.copyUniforms["opacity"].value = strength;
		this.materialCopy = new ShaderMaterial({
			uniforms: this.copyUniforms,
			vertexShader: copyShader.vertexShader,
			fragmentShader: copyShader.fragmentShader,
			blending: AdditiveBlending,
			transparent: true
		});

		// convolution material
		const convolutionShader = { ...ConvolutionShader };

		this.convolutionUniforms = UniformsUtils.clone(convolutionShader.uniforms);
		this.convolutionUniforms["uImageIncrement"].value = BLUR_X;
		this.convolutionUniforms["cKernel"].value = ConvolutionShader.buildKernel(sigma);
		this.materialConvolution = new ShaderMaterial({
			uniforms: this.convolutionUniforms,
			vertexShader: convolutionShader.vertexShader,
			fragmentShader: convolutionShader.fragmentShader,
			defines: {
				"KERNEL_SIZE_FLOAT": kernelSize.toFixed(1),
				"KERNEL_SIZE_INT": kernelSize.toFixed(0)
			}
		});

		this.needsSwap = false;
		this.fsQuad = new FullScreenQuad(null);

		this.renderToScreen = renderToScreen;
	}

	render(renderer, writeBuffer, readBuffer, deltaTime, maskActive) {

		if (maskActive) renderer.state.buffers.stencil.setTest(false);

		// Render quad with blured scene into texture (convolution pass 1)

		this.fsQuad.material = this.materialConvolution;

		this.convolutionUniforms["tDiffuse"].value = readBuffer.texture;
		this.convolutionUniforms["uImageIncrement"].value = BLUR_X;

		renderer.setRenderTarget(this.renderTargetX);
		renderer.clear();
		this.fsQuad.render(renderer);


		// Render quad with blured scene into texture (convolution pass 2)

		this.convolutionUniforms["tDiffuse"].value = this.renderTargetX.texture;
		this.convolutionUniforms["uImageIncrement"].value = BLUR_Y;

		renderer.setRenderTarget(this.renderTargetY);
		renderer.clear();
		this.fsQuad.render(renderer);

		// Render original scene with superimposed blur to texture

		this.fsQuad.material = this.materialCopy;

		this.copyUniforms["tDiffuse"].value = this.renderTargetY.texture;

		if (maskActive) renderer.state.buffers.stencil.setTest(true);

		renderer.setRenderTarget(readBuffer);
		if (this.clear) renderer.clear();
		this.fsQuad.render(renderer);
	}
}
