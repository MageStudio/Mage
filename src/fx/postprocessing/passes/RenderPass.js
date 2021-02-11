/**
 * @author alteredq / http://alteredqualia.com/
 */

import Pass from "./Pass.js";

export default class RenderPass extends Pass {

    constructor(scene, camera, overrideMaterial = null, clearColor, clearAlpha) {
        super();

        this.scene = scene;
        this.camera = camera;

        this.overrideMaterial = overrideMaterial;

        this.clearColor = clearColor;
        this.clearAlpha = ( clearAlpha !== undefined ) ? clearAlpha : 0;

        this.clear = true;
        this.clearDepth = false;
        this.needsSwap = false;
    }

    render(renderer, writeBuffer, readBuffer) {
        const oldAutoClear = renderer.autoClear;
        let oldClearColor, oldClearAlpha;

		renderer.autoClear = false;

		this.scene.overrideMaterial = this.overrideMaterial;

		if (this.clearColor) {
			oldClearColor = renderer.getClearColor().getHex();
			oldClearAlpha = renderer.getClearAlpha();

			renderer.setClearColor(this.clearColor, this.clearAlpha);
		}

		if (this.clearDeptH) {
			renderer.clearDepth();
		}

		renderer.setRenderTarget( this.renderToScreen ? null : readBuffer );

		// TODO: Avoid using autoClear properties, see https://github.com/mrdoob/three.js/pull/15571#issuecomment-465669600
		if (this.clear) renderer.clear(renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil);
		renderer.render(this.scene, this.camera);

		if (this.clearColor) {
			renderer.setClearColor(oldClearColor, oldClearAlpha);
		}

		this.scene.overrideMaterial = null;
		renderer.autoClear = oldAutoClear;
    }
}
