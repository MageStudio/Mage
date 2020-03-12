/**
 * @author alteredq / http://alteredqualia.com/
 */

import {
	Clock,
	LinearFilter,
	RGBAFormat,
	Vector2,
	WebGLRenderTarget
} from "three";

import ShaderPass from './ShaderPass';
import CopyShader from '../shaders/CopyShader';
import MaskPass from './MaskPass';
import ClearMaskPass from './ClearMaskPass';

export default class EffectComposer {

	constructor(renderer, renderTarget) {
		this.renderer = renderer;

		if (renderTarget === undefined) {
			const parameters = {
				minFilter: LinearFilter,
				magFilter: LinearFilter,
				format: RGBAFormat,
				stencilBuffer: false
			};

			const size = renderer.getSize(new Vector2());
			this._pixelRatio = renderer.getPixelRatio();
			this._width = size.width;
			this._height = size.height;

			renderTarget = new WebGLRenderTarget(this._width * this._pixelRatio, this._height * this._pixelRatio, parameters);
			renderTarget.texture.name = 'EffectComposer.rt1';
		} else {
			this._pixelRatio = 1;
			this._width = renderTarget.width;
			this._height = renderTarget.height;
		}

		this.renderTarget1 = renderTarget;
		this.renderTarget2 = renderTarget.clone();
		this.renderTarget2.texture.name = 'EffectComposer.rt2';

		this.writeBuffer = this.renderTarget1;
		this.readBuffer = this.renderTarget2;

		this.renderToScreen = true;

		this.passes = [];

		// dependencies

		if (CopyShader === undefined) {
			console.error('EffectComposer relies on CopyShader');
		}

		if (ShaderPass === undefined) {
			console.error('EffectComposer relies on ShaderPass');
		}

		this.copyPass = new ShaderPass(CopyShader);
		this.clock = new Clock();
	}

	swapBuffers() {
		const tmp = this.readBuffer;
		this.readBuffer = this.writeBuffer;
		this.writeBuffer = tmp;
	}

	addPass(pass) {
		this.passes.push(pass);
		pass.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
	}

	insertPass(pass, index) {
		this.passes.splice(index, 0, pass);
	}

	isLastEnabledPass(passIndex) {
		for (var i = passIndex + 1; i < this.passes.length; i ++) {
			if (this.passes[i].enabled) {
				return false;
			}
		}
		return true;
	}

	render(deltaTime) {
		// deltaTime value is in seconds
		if (deltaTime === undefined) {
			deltaTime = this.clock.getDelta();
		}

		var currentRenderTarget = this.renderer.getRenderTarget();

		var maskActive = false;

		var pass, i, il = this.passes.length;

		for (i = 0; i < il; i ++) {

			pass = this.passes[i];

			if (pass.enabled === false) continue;

			pass.renderToScreen = (this.renderToScreen && this.isLastEnabledPass(i));
			pass.render(this.renderer, this.writeBuffer, this.readBuffer, deltaTime, maskActive);

			if (pass.needsSwap) {
				if (maskActive) {
					const context = this.renderer.getContext();
					const stencil = this.renderer.state.buffers.stencil;

					//context.stencilFunc(context.NOTEQUAL, 1, 0xffffffff);
					stencil.setFunc(context.NOTEQUAL, 1, 0xffffffff);

					this.copyPass.render(this.renderer, this.writeBuffer, this.readBuffer, deltaTime);

					//context.stencilFunc(context.EQUAL, 1, 0xffffffff);
					stencil.setFunc(context.EQUAL, 1, 0xffffffff);
				}
				this.swapBuffers();
			}

			if (MaskPass !== undefined) {
				if (pass instanceof MaskPass) {
					maskActive = true;
				} else if (pass instanceof ClearMaskPass) {
					maskActive = false;
				}
			}
		}
		this.renderer.setRenderTarget(currentRenderTarget);
	}

	reset(renderTarget) {
		if (renderTarget === undefined) {
			const size = this.renderer.getSize(new Vector2());
			this._pixelRatio = this.renderer.getPixelRatio();
			this._width = size.width;
			this._height = size.height;

			renderTarget = this.renderTarget1.clone();
			renderTarget.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
		}

		this.renderTarget1.dispose();
		this.renderTarget2.dispose();
		this.renderTarget1 = renderTarget;
		this.renderTarget2 = renderTarget.clone();

		this.writeBuffer = this.renderTarget1;
		this.readBuffer = this.renderTarget2;
	}

	setSize(width, height) {

		this._width = width;
		this._height = height;

		const effectiveWidth = this._width * this._pixelRatio;
		const effectiveHeight = this._height * this._pixelRatio;

		this.renderTarget1.setSize(effectiveWidth, effectiveHeight);
		this.renderTarget2.setSize(effectiveWidth, effectiveHeight);

		for (var i = 0; i < this.passes.length; i ++) {
			this.passes[ i ].setSize(effectiveWidth, effectiveHeight);
		}
	}

	setPixelRatio(pixelRatio) {
		this._pixelRatio = pixelRatio;
		this.setSize(this._width, this._height);
	}
}
