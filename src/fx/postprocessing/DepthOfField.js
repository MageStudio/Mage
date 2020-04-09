import {
    ShaderMaterial,
    LinearFilter,
    RGBFormat,
    WebGLRenderTarget,
    UniformsUtils,
    Mesh,
    PlaneBufferGeometry,
    Vector2
} from 'three';

import SceneManager from '../../base/SceneManager';
import config from '../../base/config';

import BokehPass from './BokehPass';

import { BokehDepthShader, BokehShader2 } from './shaders/BokehShader2';

export default class DepthOfField extends BokehPass {

    constructor(params) {
        const { w: width, h: height } = config.screen();
        super(
            SceneManager.scene,
            SceneManager.camera.object,
            { ...params, width, height });
    }
};

export class DepthOfField2 {

    constructor(params) {
        const {
    		focalLength = 35
        } = params;

        const depthShader = { ...BokehDepthShader };
        const bokeh_shader = { ...BokehShader2 };
        const { w: width, h: height } = config.screen();

        this.shaderSettings = {
        	rings: 3,
        	samples: 4
        };

    	this.materialDepth = new ShaderMaterial({
    		uniforms: depthShader.uniforms,
    		vertexShader: depthShader.vertexShader,
    		fragmentShader: depthShader.fragmentShader
    	});

    	this.materialDepth.uniforms['mNear'].value = SceneManager.camera.object.near;
    	this.materialDepth.uniforms['mFar'].value = SceneManager.camera.object.far;

        const pars = { minFilter: LinearFilter, magFilter: LinearFilter, format: RGBFormat };
    	this.rtTextureDepth = new WebGLRenderTarget(width, height, pars);
    	this.rtTextureColor = new WebGLRenderTarget(width, height, pars);


    	this.bokeh_uniforms = UniformsUtils.clone(bokeh_shader.uniforms);

    	this.bokeh_uniforms['tColor'].value = this.rtTextureColor.texture;
    	this.bokeh_uniforms['tDepth'].value = this.rtTextureDepth.texture;
    	this.bokeh_uniforms['textureWidth'].value = width;
    	this.bokeh_uniforms['textureHeight'].value = height;

    	this.materialBokeh = new ShaderMaterial({
    		uniforms: this.bokeh_uniforms,
    		vertexShader: bokeh_shader.vertexShader,
    		fragmentShader: bokeh_shader.fragmentShader,
    		defines: {
    			RINGS: this.shaderSettings.rings,
    			SAMPLES: this.shaderSettings.samples
    		}
    	});

    	this.quad = new Mesh(new PlaneBufferGeometry(width, height), this.materialBokeh);
    	this.quad.position.z = - 500;

        this.update(params);

    	SceneManager.scene.add(this.quad);
        SceneManager.camera.object.setFocalLength(focalLength);
    }

    update(params) {
        for (let e in params ) {
			if (e in this.bokeh_uniforms) {
				this.bokeh_uniforms[e].value = params[e];
			}
		}

		this.bokeh_uniforms['znear'].value = SceneManager.camera.object.near;
		this.bokeh_uniforms['zfar'].value = SceneManager.camera.object.far;
    }

    render() {
        SceneManager.renderer.clear();

		// render scene into texture

		SceneManager.renderer.setRenderTarget(this.rtTextureColor);
		SceneManager.renderer.clear();
		SceneManager.renderer.render(SceneManager.scene, SceneManager.camera.object);

		// render depth into texture

		SceneManager.scene.overrideMaterial = this.materialDepth;
		SceneManager.renderer.setRenderTarget(this.rtTextureDepth);
		SceneManager.renderer.clear();
		SceneManager.renderer.render(SceneManager.scene, SceneManager.camera.object);
		SceneManager.scene.overrideMaterial = null;

		// render bokeh composite

		SceneManager.renderer.setRenderTarget(null);
		SceneManager.renderer.render(SceneManager.scene, SceneManager.camera.object);

    }
}
