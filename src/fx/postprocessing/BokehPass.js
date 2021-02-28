/**
 * Depth-of-field post-process with bokeh shader
 */

import {
    Color,
    MeshDepthMaterial,
    NearestFilter,
    NoBlending,
    RGBADepthPacking,
    ShaderMaterial,
    UniformsUtils,
    WebGLRenderTarget
} from 'three';
import Pass from './passes/Pass';

import BokehShader from './shaders/BokehShader.js';

export default class BokehPass extends Pass {

    constructor(scene, camera, params) {
        super();

        const {
            focus = 1.0,
            aspect = camera.aspect,
            aperture = 0.025,
            maxblur = 0.1,
            width = window.innerWidth,
            height = window.innerHeight,
            renderToScreen = false
        } = params;

        this.scene = scene;
        this.camera = camera;

        this.renderTargetDepth = new WebGLRenderTarget(width, height, {
            minFilter: NearestFilter,
            magFilter: NearestFilter
        });

        this.renderTargetDepth.texture.name = 'BokehPass.depth';

        // depth material

        this.materialDepth = new MeshDepthMaterial();
        this.materialDepth.depthPacking = RGBADepthPacking;
        this.materialDepth.blending = NoBlending;


        const bokehShader = BokehShader;
        const bokehUniforms = UniformsUtils.clone(bokehShader.uniforms);

        bokehUniforms['tDepth'].value = this.renderTargetDepth.texture;

        bokehUniforms['focus'].value = focus;
        bokehUniforms['aspect'].value = aspect;
        bokehUniforms['aperture'].value = aperture;
        bokehUniforms['maxblur'].value = maxblur;
        bokehUniforms['nearClip'].value = camera.near;
        bokehUniforms['farClip'].value = camera.far;

        this.materialBokeh = new ShaderMaterial({
            defines: Object.assign({}, bokehShader.defines),
            uniforms: bokehUniforms,
            vertexShader: bokehShader.vertexShader,
            fragmentShader: bokehShader.fragmentShader
        });

        this.uniforms = bokehUniforms;
        this.needsSwap = false;

        this.fsQuad = new Pass.FullScreenQuad(this.materialBokeh);

        this._oldClearColor = new Color();
        this.renderToScreen = renderToScreen;
    }

    render(renderer, writeBuffer, readBuffer/*, deltaTime, maskActive*/) {
        this.scene.overrideMaterial = this.materialDepth;

        renderer.getClearColor(this._oldClearColor);
        const oldClearAlpha = renderer.getClearAlpha();
        const oldAutoClear = renderer.autoClear;
        renderer.autoClear = false;

        renderer.setClearColor(0xffffff);
        renderer.setClearAlpha(1.0);
        renderer.setRenderTarget(this.renderTargetDepth);
        renderer.clear();
        renderer.render(this.scene, this.camera);

        // Render bokeh composite

        this.uniforms['tColor'].value = readBuffer.texture;
        this.uniforms['nearClip'].value = this.camera.near;
        this.uniforms['farClip'].value = this.camera.far;

        if (this.renderToScreen) {

            renderer.setRenderTarget(null);
            this.fsQuad.render(renderer);

        } else {

            renderer.setRenderTarget(writeBuffer);
            renderer.clear();
            this.fsQuad.render(renderer);

        }

        this.scene.overrideMaterial = null;
        renderer.setClearColor(this._oldClearColor);
        renderer.setClearAlpha(oldClearAlpha);
        renderer.autoClear = oldAutoClear;
    }
}
