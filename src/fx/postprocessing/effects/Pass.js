import {
    Mesh,
    OrthographicCamera,
    PlaneBufferGeometry
} from 'three';

export default class Pass {

    constructor() {
        // if set to true, the pass is processed by the composer
    	this.enabled = true;

    	// if set to true, the pass indicates to swap read and write buffer after rendering
    	this.needsSwap = true;

    	// if set to true, the pass clears its buffer before rendering
    	this.clear = false;

    	// if set to true, the result of the pass is rendered to screen. This is set automatically by EffectComposer.
    	this.renderToScreen = false;
    }

    setSize(width, height) {}

    render(renderer, writeBuffer, readBuffer, delta, maskActive) {
		console.error('Pass: .render() must be implemented in derived pass.');
	}
}

// Helper for passes that need to fill the viewport with a single quad.
Pass.FullScreenQuad = (function () {

	const camera = new OrthographicCamera(- 1, 1, 1, - 1, 0, 1);
	const geometry = new PlaneBufferGeometry(2, 2);

	const FullScreenQuad = function (material) {

		this._mesh = new Mesh(geometry, material);

	};

	Object.defineProperty(FullScreenQuad.prototype, 'material', {

		get: function () {
			return this._mesh.material;
		},

		set: function (value) {
			this._mesh.material = value;
		}

	});

	Object.assign(FullScreenQuad.prototype, {

		dispose: function () {
			this._mesh.geometry.dispose();
		},

		render: function (renderer) {
			renderer.render(this._mesh, camera);
		}

	});

	return FullScreenQuad;

})();
