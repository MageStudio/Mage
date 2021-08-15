import {
    BackSide,
    Color,
    ShaderMaterial,
    UniformsLib,
    UniformsUtils
} from 'three';

import Scene from '../../core/Scene';

/**
 * Reference: https://en.wikipedia.org/wiki/Cel_shading
 *
 * API
 *
 * 1. Traditional
 *
 * const effect = new OutlineEffect(renderer);
 *
 * function render() {
 *
 *     effect.render(scene, camera);
 *
 * }
 *
 * 2. VR compatible
 *
 * const effect = new OutlineEffect(renderer);
 * let renderingOutline = false;
 *
 * scene.onAfterRender = function () {
 *
 *     if (renderingOutline) return;
 *
 *     renderingOutline = true;
 *
 *     effect.renderOutline(scene, camera);
 *
 *     renderingOutline = false;
 *
 * };
 *
 * function render() {
 *
 *     this.renderer.render(scene, camera);
 *
 * }
 *
 * // How to set default outline parameters
 * new OutlineEffect(renderer, {
 *     this.defaultThickness: 0.01,
 *     this.defaultColor: [0, 0, 0],
 *     this.defaultAlpha: 0.8,
    this.defaultKeepAlive: true // keeps outline material in cache even if material is removed from scene
 * });
 *
 * // How to set outline parameters for each material
 * material.userData.outlineParameters = {
 *     thickness: 0.01,
 *     color: [0, 0, 0]
 *     alpha: 0.8,
 *     visible: true,
 *     keepAlive: true
 * };
 */

const DEFAULT_THICKNESS = 0.003;
const DEFAULT_COLOR = 0x000000;
const DEFAULT_ALPHA = 1.0;
const DEFAULT_KEEPALIVE = false;

export default class OutlineEffect {

    constructor({
        defaultThickness = DEFAULT_THICKNESS,
        defaultColor = DEFAULT_COLOR,
        defaultAlpha = DEFAULT_ALPHA,
        defaultKeepAlive = DEFAULT_KEEPALIVE
    }) {

        this.enabled = true;

        this.renderer = Scene.getRenderer();

        this.defaultThickness = defaultThickness;
        this.defaultColor = new Color(defaultColor);
        this.defaultAlpha = defaultAlpha;
        this.defaultKeepAlive = defaultKeepAlive;

        // object.material.uuid -> outlineMaterial or
        // object.material[n].uuid -> outlineMaterial
        // save at the outline material creation and release
        // if it's unused this.removeThresholdCount frames
        // unless keepAlive is true.
        this.cache = {};

        this.removeThresholdCount = 60;

        // outlineMaterial.uuid -> object.material or
        // outlineMaterial.uuid -> object.material[n]
        // save before render and release after render.
        this.originalMaterials = {};

        // object.uuid -> originalOnBeforeRender
        // save before render and release after render.
        this.originalOnBeforeRenders = {};

        //this.this.cache = this.cache;  // for debug

        this.uniformsOutline = {
            outlineThickness: { value: this.defaultThickness },
            outlineColor: { value: this.defaultColor },
            outlineAlpha: { value: this.defaultAlpha }
        };

        this.vertexShader = [
            '#include <common>',
            '#include <uv_pars_vertex>',
            '#include <displacementmap_pars_vertex>',
            '#include <fog_pars_vertex>',
            '#include <morphtarget_pars_vertex>',
            '#include <skinning_pars_vertex>',
            '#include <logdepthbuf_pars_vertex>',
            '#include <clipping_planes_pars_vertex>',

            'uniform float outlineThickness;',

            'vec4 calculateOutline(vec4 pos, vec3 normal, vec4 skinned) {',
            '    float thickness = outlineThickness;',
            '    const float ratio = 1.0;', // TODO: support outline thickness ratio for each vertex
            '    vec4 pos2 = projectionMatrix * modelViewMatrix * vec4(skinned.xyz + normal, 1.0);',
            // NOTE: subtract pos2 from pos because BackSide objectNormal is negative
            '    vec4 norm = normalize(pos - pos2);',
            '    return pos + norm * thickness * pos.w * ratio;',
            '}',

            'void main() {',

            '    #include <uv_vertex>',

            '    #include <beginnormal_vertex>',
            '    #include <morphnormal_vertex>',
            '    #include <skinbase_vertex>',
            '    #include <skinnormal_vertex>',

            '    #include <begin_vertex>',
            '    #include <morphtarget_vertex>',
            '    #include <skinning_vertex>',
            '    #include <displacementmap_vertex>',
            '    #include <project_vertex>',

            '    vec3 outlineNormal = - objectNormal;', // the outline material is always rendered with BackSide

            '    gl_Position = calculateOutline(gl_Position, outlineNormal, vec4(transformed, 1.0));',

            '    #include <logdepthbuf_vertex>',
            '    #include <clipping_planes_vertex>',
            '    #include <fog_vertex>',

            '}',

       ].join('\n');

        this.fragmentShader = [

            '#include <common>',
            '#include <fog_pars_fragment>',
            '#include <logdepthbuf_pars_fragment>',
            '#include <clipping_planes_pars_fragment>',

            'uniform vec3 outlineColor;',
            'uniform float outlineAlpha;',

            'void main() {',

            '    #include <clipping_planes_fragment>',
            '    #include <logdepthbuf_fragment>',

            '    gl_FragColor = vec4(outlineColor, outlineAlpha);',

            '    #include <tonemapping_fragment>',
            '    #include <encodings_fragment>',
            '    #include <fog_fragment>',
            '    #include <premultiplied_alpha_fragment>',

            '}'

       ].join('\n');

        /*
         * See #9918
         *
         * The following property copies and wrapper methods enable
         * OutlineEffect to be called from other *Effect, like
         *
         * effect = new StereoEffect(new OutlineEffect(renderer));
         *
         * function render () {
         *
          *     effect.render(scene, camera);
         *
         * }
         */
        this.autoClear = this.renderer.autoClear;
        this.domElement = this.renderer.domElement;
        this.shadowMap = this.renderer.shadowMap;
    }

    renderOutline(scene, camera) {

        const currentAutoClear = this.renderer.autoClear;
        const currentSceneAutoUpdate = scene.autoUpdate;
        const currentSceneBackground = scene.background;
        const currentShadowMapEnabled = this.renderer.shadowMap.enabled;

        scene.autoUpdate = false;
        scene.background = null;
        this.renderer.autoClear = false;
        this.renderer.shadowMap.enabled = false;

        scene.traverse(this.setOutlineMaterial);

        this.renderer.render(scene, camera);

        scene.traverse(this.restoreOriginalMaterial);

        this.cleanupCache();

        scene.autoUpdate = currentSceneAutoUpdate;
        scene.background = currentSceneBackground;
        this.renderer.autoClear = currentAutoClear;
        this.renderer.shadowMap.enabled = currentShadowMapEnabled;

    };

    render (scene, camera, dt) {

        let renderTarget;
        let forceClear = false;

        if (arguments[3] !== undefined) {

            console.warn('THREE.OutlineEffect.render(): the renderTarget argument has been removed. Use .setRenderTarget() instead.');
            renderTarget = arguments[3];

        }

        if (arguments[4] !== undefined) {

            console.warn('THREE.OutlineEffect.render(): the forceClear argument has been removed. Use .clear() instead.');
            forceClear = arguments[4];

        }

        if (renderTarget !== undefined) this.renderer.setRenderTarget(renderTarget);

        if (forceClear) this.renderer.clear();

        if (this.enabled === false) {

            this.renderer.render(scene, camera);
            return;

        }

        const currentAutoClear = this.renderer.autoClear;
        this.renderer.autoClear = this.autoClear;

        this.renderer.render(scene, camera);

        this.renderer.autoClear = currentAutoClear;

        this.renderOutline(scene, camera);

    };

    clear(color, depth, stencil) {

        this.renderer.clear(color, depth, stencil);

    };

    getPixelRatio() {

        return this.renderer.getPixelRatio();

    }

    setPixelRatio(value) {

        this.renderer.setPixelRatio(value);

    };

    getSize(target) {

        return this.renderer.getSize(target);

    };

    setSize(width, height, updateStyle) {

        this.renderer.setSize(width, height, updateStyle);

    };

    setViewport(x, y, width, height) {

        this.renderer.setViewport(x, y, width, height);

    };

    setScissor(x, y, width, height) {

        this.renderer.setScissor(x, y, width, height);

    };

    setScissorTest(boolean) {

        this.renderer.setScissorTest(boolean);

    };

    setRenderTarget(renderTarget) {

        this.renderer.setRenderTarget(renderTarget);

    };

    createMaterial = () => {

        return new ShaderMaterial({
            type: 'OutlineEffect',
            uniforms: UniformsUtils.merge([
                UniformsLib['fog'],
                UniformsLib['displacementmap'],
                this.uniformsOutline
           ]),
            vertexShader: this.vertexShader,
            fragmentShader: this.fragmentShader,
            side: BackSide
        });
    }

    getOutlineMaterialFromCache = (originalMaterial) => {

        let data = this.cache[originalMaterial.uuid];

        if (data === undefined) {

            data = {
                material: this.createMaterial(),
                used: true,
                defaultKeepAlive: this.defaultKeepAlive,
                count: 0
            };

            this.cache[originalMaterial.uuid] = data;

        }

        data.used = true;

        return data.material;

    }

    getOutlineMaterial = (originalMaterial) => {

        const outlineMaterial = this.getOutlineMaterialFromCache(originalMaterial);

        this.originalMaterials[outlineMaterial.uuid] = originalMaterial;

        this.updateOutlineMaterial(outlineMaterial, originalMaterial);

        return outlineMaterial;

    }

    isCompatible = (object) => {

        const geometry = object.geometry;
        let hasNormals = false;

        if (object.geometry !== undefined) {

            if (geometry.isBufferGeometry) {

                hasNormals = geometry.attributes.normal !== undefined;

            } else {

                hasNormals = true; // the renderer always produces a normal attribute for Geometry

            }

        }

        return (object.isMesh === true && object.material !== undefined && hasNormals === true);

    }

    setOutlineMaterial = (object) => {

        if (this.isCompatible(object) === false) return;

        if (Array.isArray(object.material)) {

            for (let i = 0, il = object.material.length; i < il; i ++) {

                object.material[i] = this.getOutlineMaterial(object.material[i]);

            }

        } else {

            object.material = this.getOutlineMaterial(object.material);

        }

        this.originalOnBeforeRenders[object.uuid] = object.onBeforeRender;
        object.onBeforeRender = this.onBeforeRender;

    }

    restoreOriginalMaterial = (object) => {

        if (this.isCompatible(object) === false) return;

        if (Array.isArray(object.material)) {

            for (let i = 0, il = object.material.length; i < il; i ++) {

                object.material[i] = this.originalMaterials[object.material[i].uuid];

            }

        } else {

            object.material = this.originalMaterials[object.material.uuid];

        }

        object.onBeforeRender = this.originalOnBeforeRenders[object.uuid];

    }

    onBeforeRender = (renderer, scene, camera, geometry, material) => {

        const originalMaterial = this.originalMaterials[material.uuid];

        // just in case
        if (originalMaterial === undefined) return;

        this.updateUniforms(material, originalMaterial);

    }

    updateUniforms = (material, originalMaterial) => {

        const outlineParameters = originalMaterial.userData.outlineParameters;

        material.uniforms.outlineAlpha.value = originalMaterial.opacity;

        if (outlineParameters !== undefined) {

            if (outlineParameters.thickness !== undefined) material.uniforms.outlineThickness.value = outlineParameters.thickness;
            if (outlineParameters.color !== undefined) material.uniforms.outlineColor.value.fromArray(outlineParameters.color);
            if (outlineParameters.alpha !== undefined) material.uniforms.outlineAlpha.value = outlineParameters.alpha;

        }

        if (originalMaterial.displacementMap) {

            material.uniforms.displacementMap.value = originalMaterial.displacementMap;
            material.uniforms.displacementScale.value = originalMaterial.displacementScale;
            material.uniforms.displacementBias.value = originalMaterial.displacementBias;

        }

    }

    updateOutlineMaterial = (material, originalMaterial) => {

        if (material.name === 'invisible') return;

        const outlineParameters = originalMaterial.userData.outlineParameters;

        material.fog = originalMaterial.fog;
        material.toneMapped = originalMaterial.toneMapped;
        material.premultipliedAlpha = originalMaterial.premultipliedAlpha;
        material.displacementMap = originalMaterial.displacementMap;

        if (outlineParameters !== undefined) {

            if (originalMaterial.visible === false) {

                material.visible = false;

            } else {

                material.visible = (outlineParameters.visible !== undefined) ? outlineParameters.visible : true;

            }

            material.transparent = (outlineParameters.alpha !== undefined && outlineParameters.alpha < 1.0) ? true : originalMaterial.transparent;

            if (outlineParameters.keepAlive !== undefined) this.cache[originalMaterial.uuid].keepAlive = outlineParameters.keepAlive;

        } else {

            material.transparent = originalMaterial.transparent;
            material.visible = originalMaterial.visible;

        }

        if (originalMaterial.wireframe === true || originalMaterial.depthTest === false) material.visible = false;

        if (originalMaterial.clippingPlanes) {

            material.clipping = true;

            material.clippingPlanes = originalMaterial.clippingPlanes;
            material.clipIntersection = originalMaterial.clipIntersection;
            material.clipShadows = originalMaterial.clipShadows;

        }

        material.version = originalMaterial.version; // update outline material if necessary

    }

    cleanupCache = () => {

        let keys;

        // clear originialMaterials
        keys = Object.keys(this.originalMaterials);

        for (let i = 0, il = keys.length; i < il; i ++) {

            this.originalMaterials[keys[i]] = undefined;

        }

        // this.originalOnBeforeRenders
        keys = Object.keys(this.originalOnBeforeRenders);

        for (let i = 0, il = keys.length; i < il; i ++) {

            this.originalOnBeforeRenders[keys[i]] = undefined;

        }

        // remove unused outlineMaterial from this.cache
        keys = Object.keys(this.cache);

        for (let i = 0, il = keys.length; i < il; i ++) {

            const key = keys[i];

            if (this.cache[key].used === false) {

                this.cache[key].count ++;

                if (this.cache[key].keepAlive === false && this.cache[key].count > this.removeThresholdCount) {

                    delete this.cache[key];

                }

            } else {

                this.cache[key].used = false;
                this.cache[key].count = 0;

            }

        }

    }

}