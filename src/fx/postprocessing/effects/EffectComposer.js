/**
 * @author alteredq / http://alteredqualia.com/
 */

import {
    WebGLRenderTarget,
    RGBAFormat,
    LinearFilter
} from 'three';

import ShaderPass from './ShaderPass';
import CopyShader from './CopyShader';
import MaskPass from './MaskPass';
import ClearMaskPass from './ClearMaskPass';

export default class EffectComposer {

    constructor ( renderer, renderTarget ) {

    	this.renderer = renderer;

    	if ( renderTarget === undefined ) {

    		var parameters = {
    			minFilter: LinearFilter,
    			magFilter: LinearFilter,
    			format: RGBAFormat,
    			stencilBuffer: false
    		};

    		var size = renderer.getDrawingBufferSize();
    		renderTarget = new WebGLRenderTarget( size.width, size.height, parameters );
    		renderTarget.texture.name = 'EffectComposer.rt1';

    	}

    	this.renderTarget1 = renderTarget;
    	this.renderTarget2 = renderTarget.clone();
    	this.renderTarget2.texture.name = 'EffectComposer.rt2';

    	this.writeBuffer = this.renderTarget1;
    	this.readBuffer = this.renderTarget2;

    	this.passes = [];

    	this.copyPass = new ShaderPass(CopyShader);

    }

    swapBuffers() {
		var tmp = this.readBuffer;
		this.readBuffer = this.writeBuffer;
		this.writeBuffer = tmp;
	}

	addPass(pass) {
		this.passes.push( pass );

		var size = this.renderer.getDrawingBufferSize();
		pass.setSize( size.width, size.height );
	}

	insertPass(pass, index) {
		this.passes.splice( index, 0, pass );
	}

    render(delta) {
		var maskActive = false;
		var pass, i, il = this.passes.length;

		for ( i = 0; i < il; i ++ ) {
			pass = this.passes[ i ];

			if ( pass.enabled === false ) continue;

			pass.render( this.renderer, this.writeBuffer, this.readBuffer, delta, maskActive );

			if ( pass.needsSwap ) {
				if ( maskActive ) {
					var context = this.renderer.context;
					context.stencilFunc( context.NOTEQUAL, 1, 0xffffffff );
					this.copyPass.render( this.renderer, this.writeBuffer, this.readBuffer, delta );
					context.stencilFunc( context.EQUAL, 1, 0xffffffff );
	            }
				this.swapBuffers();
			}

			if (MaskPass !== undefined ) {
				if ( pass instanceof MaskPass ) {
					maskActive = true;
				} else if ( pass instanceof ClearMaskPass ) {
					maskActive = false;
				}
			}
		}
	}

	reset(renderTarget) {
		if ( renderTarget === undefined ) {
			var size = this.renderer.getDrawingBufferSize();

			renderTarget = this.renderTarget1.clone();
			renderTarget.setSize( size.width, size.height );
		}

		this.renderTarget1.dispose();
		this.renderTarget2.dispose();
		this.renderTarget1 = renderTarget;
		this.renderTarget2 = renderTarget.clone();

		this.writeBuffer = this.renderTarget1;
		this.readBuffer = this.renderTarget2;
	}

	setSize( width, height ) {
		this.renderTarget1.setSize( width, height );
		this.renderTarget2.setSize( width, height );

		for ( var i = 0; i < this.passes.length; i ++ ) {
			this.passes[ i ].setSize( width, height );
		}
	}
}
